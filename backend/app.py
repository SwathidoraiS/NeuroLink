from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
import jwt
import datetime
import os
from dotenv import load_dotenv
from functools import wraps
from groq import Groq

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)
print("GROQ KEY LOADED:", GROQ_API_KEY)

app = Flask(__name__)

# ---------------------------
# 🌐 FIXED CORS CONFIG
# ---------------------------
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        return response

# Secret key for JWT
app.config["SECRET_KEY"] = os.getenv("JWT_SECRET", "neuro_secret_key")

# ---------------------------
# 🧩 MongoDB Connection
# ---------------------------
try:
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client["nuerolink_db"]
    users = db["users"]
    courses_col = db["courses"]
    print("✅ Successfully connected to MongoDB")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

# ---------------------------
# 🔐 JWT Middleware
# ---------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Access denied. Token missing!"}), 401

        try:
            decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = users.find_one({"_id": ObjectId(decoded["user_id"])})
            if not current_user:
                return jsonify({"error": "User not found"}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired, please login again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# ---------------------------
# 🧠 AUTH ROUTES
# ---------------------------
@app.route("/api/auth/register", methods=["POST"])
def register_user():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if users.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_pw.decode("utf-8"),
        "created_at": datetime.datetime.utcnow()
    })

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login_user():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"error": "Invalid email or password"}), 401

    token = jwt.encode({
        "user_id": str(user["_id"]),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }, app.config["SECRET_KEY"], algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"name": user["name"], "email": user["email"]}
    }), 200


# ---------------------------
# 👤 USER PROFILE ROUTES
# ---------------------------

def _serialize_user_doc(doc):
    return {
        "id": str(doc.get("_id")),
        "name": doc.get("name"),
        "email": doc.get("email"),
        "department": doc.get("department"),
        "year": doc.get("year"),
        "learning_styles": doc.get("learning_styles", []),
        "subjects": doc.get("subjects", []),
        "college": doc.get("college"),
        "phone": doc.get("phone"),
        "enrollment_number": doc.get("enrollment_number"),
        "dob": doc.get("dob"),
        "cognitive_profile": doc.get("cognitive_profile", {}),
        "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None
    }

@app.route("/api/user/profile", methods=["GET"])
@token_required
def get_user_profile(current_user):
    return jsonify(_serialize_user_doc(current_user)), 200

@app.route("/api/user/profile", methods=["PUT"])
@token_required
def update_user_profile(current_user):
    data = request.get_json() or {}

    allowed = {
        "name": str,
        "department": str,
        "year": (str, int),
        "learning_styles": list,
        "subjects": list,
        "college": str,
        "phone": str,
        "enrollment_number": str,
        "dob": str,
    }

    updates = {}
    for key, expected_type in allowed.items():
        if key in data:
            value = data[key]
            if expected_type is list:
                if not isinstance(value, list):
                    return jsonify({"error": f"{key} must be a list"}), 400
                updates[key] = [str(v).strip() for v in value]
            else:
                updates[key] = str(value).strip()

    users.update_one({"_id": current_user["_id"]}, {"$set": updates})
    updated = users.find_one({"_id": current_user["_id"]})

    return jsonify(_serialize_user_doc(updated)), 200


# ---------------------------
# 🧠 ADVANCED COGNITIVE PROFILE ENGINE
# ---------------------------
from statistics import mean

@app.route("/api/cognitive/profile/analyze", methods=["POST"])
@token_required
def analyze_cognitive_profile(current_user):
    user_id = str(current_user["_id"])

    # Fetch user data
    learning = current_user.get("learning_styles", [])
    subjects = current_user.get("subjects", [])
    dept = current_user.get("department", "Unknown")
    year = current_user.get("year", "Unknown")

    # ----------------------------------------------------
    # 1️⃣ Read REAL signals from emotions
    # ----------------------------------------------------
    emotions_col = db["emotions"]
    recent_emotions = list(
        emotions_col.find({"user_id": user_id}).sort("timestamp", -1).limit(15)
    )

    if recent_emotions:
        focus_scores = []
        stress_scores = []
        motivation_scores = []
        intensities = []
        emotion_names = []

        for e in recent_emotions:
            ai = e.get("ai", {})
            intensities.append(e.get("intensity", 50))
            emotion_names.append(e.get("emotion"))

            if ai.get("focus_score") is not None:
                focus_scores.append(ai["focus_score"])
            if ai.get("stress_score") is not None:
                stress_scores.append(ai["stress_score"])
            if ai.get("motivation_score") is not None:
                motivation_scores.append(ai["motivation_score"])

        dominant_emotion = Counter(emotion_names).most_common(1)[0][0]
        avg_focus = round(mean(focus_scores)) if focus_scores else 55
        avg_stress = round(mean(stress_scores)) if stress_scores else 55
        avg_motivation = round(mean(motivation_scores)) if motivation_scores else 55
        emotional_intensity = round(mean(intensities)) if intensities else 50

    else:
        dominant_emotion = "Neutral"
        avg_focus = 55
        avg_stress = 55
        avg_motivation = 55
        emotional_intensity = 50

    # ----------------------------------------------------
    # 2️⃣ Read REAL signals from Decisions
    # ----------------------------------------------------
    decisions = list(
        db["decisions"].find({"user_id": user_id}).sort("timestamp", -1).limit(10)
    )
    if decisions:
        confidence_scores = [
            d["result"].get("confidence_score", 50)
            for d in decisions
        ]
        decision_confidence = round(mean(confidence_scores))
    else:
        decision_confidence = 55

    # ----------------------------------------------------
    # 3️⃣ Read REAL Course performance
    # ----------------------------------------------------
    courses = list(db["courses"].find({"user_id": user_id}))
    if courses:
        progresses = [c.get("progress_percent", 0) for c in courses]
        course_engagement = round(mean(progresses))
    else:
        course_engagement = 0

    # ----------------------------------------------------
    # 4️⃣ Cognitive Metric Synthesis
    # ----------------------------------------------------

    # Cognitive Style → Based on learning + emotions
    if "Visual" in learning:
        cognitive_style = "Visual Reasoner"
    elif "Auditory" in learning:
        cognitive_style = "Auditory Thinker"
    elif "Kinesthetic" in learning:
        cognitive_style = "Hands-on Learner"
    else:
        cognitive_style = "Adaptive Learner"

    # Processing Speed → Derived from focus + engagement
    processing_speed = (
        (avg_focus * 0.6) +
        (course_engagement * 0.4)
    )
    processing_speed = f"{round(processing_speed)}%"

    # Pattern Recognition → Based on subjects + decision consistency
    pattern_recognition = (
        (decision_confidence * 0.5) +
        (avg_focus * 0.3) +
        (100 - avg_stress) * 0.2
    )
    pattern_recognition = f"{round(pattern_recognition)}%"

    # Stress Resilience → lower stress + higher motivation
    stress_resilience = (
        ((100 - avg_stress) * 0.7) +
        (avg_motivation * 0.3)
    )
    stress_resilience = f"{round(stress_resilience)}%"

    # Problem Solving → Focus + Decision Confidence
    problem_solving = (
        (avg_focus * 0.5) +
        (decision_confidence * 0.5)
    )
    problem_solving = f"{round(problem_solving)}%"

    # Goal Orientation → Motivation + course engagement
    goal_orientation = (
        (avg_motivation * 0.6) +
        (course_engagement * 0.4)
    )
    goal_orientation = f"{round(goal_orientation)}%"

    # Cognitive Score (overall)
    cognitive_score = round(mean([
        float(processing_speed[:-1]),
        float(pattern_recognition[:-1]),
        float(stress_resilience[:-1]),
        float(problem_solving[:-1]),
        float(goal_orientation[:-1])
    ]))

    # ----------------------------------------------------
    # 5️⃣ Strengths + Improvement Areas
    # ----------------------------------------------------
    strengths = []
    improvements = []

    if avg_focus > 70:
        strengths.append("Strong sustained attention")
    else:
        improvements.append("Improve focus consistency")

    if avg_motivation > 70:
        strengths.append("High intrinsic motivation")
    else:
        improvements.append("Build motivation through goal setting")

    if (100 - avg_stress) > 70:
        strengths.append("Good stress tolerance")
    else:
        improvements.append("Need better stress management")

    if decision_confidence > 70:
        strengths.append("Confident decision-maker")
    else:
        improvements.append("Increase decision confidence")

    if course_engagement > 60:
        strengths.append("Consistent academic engagement")
    else:
        improvements.append("Increase learning engagement")

    # ----------------------------------------------------
    # 6️⃣ Final cognitive object
    # ----------------------------------------------------
    cognitive_obj = {
        "cognitive_style": cognitive_style,
        "processing_speed": processing_speed,
        "pattern_recognition": pattern_recognition,
        "stress_resilience": stress_resilience,
        "problem_solving": problem_solving,
        "goal_orientation": goal_orientation,
        "cognitive_score": cognitive_score,
        "strengths": strengths,
        "areas_to_improve": improvements
    }

    # Save to DB
    users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"cognitive_profile": cognitive_obj}}
    )

    updated = users.find_one({"_id": current_user["_id"]})
    return jsonify(_serialize_user_doc(updated)), 200


# ============================================================
# 🧠 HYBRID COGNITIVE DASHBOARD ENGINE (CLEAN VERSION)
# ============================================================
from statistics import mean
from collections import Counter

@app.route("/api/dashboard", methods=["GET"])
@token_required
def get_dashboard_data(current_user):
    user_id = str(current_user["_id"])

    # ----------------------------------------------------------
    # 1️⃣ REAL-TIME EMOTION SIGNALS
    # ----------------------------------------------------------
    emotions_col = db["emotions"]
    recent = list(
        emotions_col.find({"user_id": user_id})
        .sort("timestamp", -1)
        .limit(20)
    )

    if recent:
        emotion_names = [e.get("emotion") for e in recent]
        intensities = [e.get("intensity", 50) for e in recent]

        dominant_emotion = Counter(emotion_names).most_common(1)[0][0]
        avg_intensity = round(mean(intensities))
        emotion_variety = len(set(emotion_names))

        # AI-based scores
        focus_scores = []
        stress_scores = []
        motivation_scores = []

        for e in recent:
            ai = e.get("ai") or {}
            if ai.get("focus_score") is not None:
                focus_scores.append(ai["focus_score"])
            if ai.get("stress_score") is not None:
                stress_scores.append(ai["stress_score"])
            if ai.get("motivation_score") is not None:
                motivation_scores.append(ai["motivation_score"])

        focus_avg = round(mean(focus_scores)) if focus_scores else 50
        stress_avg = round(mean(stress_scores)) if stress_scores else 50
        motivation_avg = round(mean(motivation_scores)) if motivation_scores else 50

    else:
        dominant_emotion = None
        avg_intensity = 0
        emotion_variety = 0
        focus_avg = 50
        stress_avg = 50
        motivation_avg = 50

    # ----------------------------------------------------------
    # 2️⃣ REAL-TIME DECISION CONFIDENCE
    # ----------------------------------------------------------
    decisions_col = db["decisions"]
    last_decisions = list(
        decisions_col.find({"user_id": user_id})
        .sort("timestamp", -1)
        .limit(10)
    )

    confidence_scores = [
        d["result"].get("confidence_score", 50)
        for d in last_decisions if d.get("result")
    ]

    decision_confidence_avg = (
        round(mean(confidence_scores)) if confidence_scores else 50
    )

    # ----------------------------------------------------------
    # 3️⃣ COURSE ENGAGEMENT (REAL-TIME)
    # ----------------------------------------------------------
    user_courses = list(db["courses"].find({"user_id": user_id}))
    if user_courses:
        course_progresses = [c.get("progress_percent", 0) for c in user_courses]
        course_engagement = round(mean(course_progresses))
    else:
        course_engagement = 0

    # ----------------------------------------------------------
    # 4️⃣ CACHED AI SCORES (OPTIONAL)
    # ----------------------------------------------------------
    cache = current_user.get("dashboard_cache", {})

    cpi = cache.get("cpi", 60)
    emotional_stability_score = cache.get("emotional_stability_score", 60)
    cognitive_alignment = cache.get("cognitive_alignment", "Neutral")

    # ----------------------------------------------------------
    # 5️⃣ FINAL RESPONSE
    # ----------------------------------------------------------
    return jsonify({
        "user": {
            "name": current_user.get("name"),
            "email": current_user.get("email"),
        },

        "real_time": {
            "dominant_emotion": dominant_emotion,
            "emotion_avg_intensity": avg_intensity,
            "emotion_variety": emotion_variety,
            "focus_avg": focus_avg,
            "stress_avg": stress_avg,
            "motivation_avg": motivation_avg,
            "decision_confidence_avg": decision_confidence_avg,
            "course_engagement": course_engagement,
        },

        "cached_ai": {
            "cognitive_performance_index": cpi,
            "emotional_stability_score": emotional_stability_score,
            "cognitive_alignment": cognitive_alignment,
        }
    }), 200


# ============================================================
# 🧠 CLEAN EMOTION SUMMARY (DASHBOARD VERSION)
# ============================================================
@app.route("/api/emotions/summary", methods=["GET"])
@token_required
def get_emotion_summary(current_user):
    emotions_col = db["emotions"]
    records = list(
        emotions_col.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1).limit(5)
    )

    if not records:
        return jsonify({
            "stability": "No data",
            "dominant_emotion": None,
            "average_intensity": 0
        }), 200

    emotion_counts = Counter([e["emotion"] for e in records])
    total_intensity = [e.get("intensity", 50) for e in records]

    dominant = emotion_counts.most_common(1)[0][0]
    avg_intensity = round(mean(total_intensity))

    variety = len(emotion_counts)
    stability = (
        "Stable" if variety <= 2 else
        "Balanced" if variety <= 4 else
        "Fluctuating"
    )

    return jsonify({
        "stability": stability,
        "dominant_emotion": dominant,
        "average_intensity": avg_intensity
    }), 200


# ============================================
# ❤️ EMOTION TRACKER — COGNITIVE TWIN ENGINE
# ============================================
from collections import Counter
import json

@app.route("/api/emotions", methods=["POST"])
@token_required
def add_emotion(current_user):
    data = request.get_json() or {}
    emotion = data.get("emotion")
    intensity = data.get("intensity", 50)

    if not emotion:
        return jsonify({"error": "Emotion is required"}), 400

    # ------------------------------------------
    # AI INTERPRETATION PROMPT
    # ------------------------------------------
    prompt = f"""
    You are an Emotional Cognitive Twin Engine analyzing the user's emotional state.

    Emotion Logged: {emotion}
    Intensity: {intensity}

    Output STRICT JSON:

    {{
      "focus_score": number (0-100),
      "stress_score": number (0-100),
      "motivation_score": number (0-100),
      "cognitive_state": "string",
      "interpretation": "short explanation",
      "recommendation": "one actionable suggestion"
    }}
    """

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        raw = completion.choices[0].message.content
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        ai_data = json.loads(cleaned)

    except Exception as e:
        print("AI Emotion Error:", e)
        ai_data = {
            "focus_score": 50,
            "stress_score": 50,
            "motivation_score": 50,
            "cognitive_state": "neutral",
            "interpretation": "AI failed to interpret emotion, fallback values used.",
            "recommendation": "Try logging again in a moment."
        }

    emotions_col = db["emotions"]
    emotions_col.insert_one({
        "user_id": str(current_user["_id"]),
        "emotion": emotion,
        "intensity": intensity,
        "timestamp": datetime.datetime.utcnow(),
        "ai": ai_data
    })

    return jsonify({
        "message": "Emotion recorded successfully",
        "ai": ai_data
    }), 201


# ===================================================
# GET ALL EMOTIONS (with cognitive interpretation)
# ===================================================
@app.route("/api/emotions", methods=["GET"])
@token_required
def get_emotions(current_user):
    emotions_col = db["emotions"]
    user_emotions = list(
        emotions_col.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1)
    )

    for e in user_emotions:
        e["_id"] = str(e["_id"])
        e["timestamp"] = e["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
        if "ai" not in e:
            e["ai"] = {}

    return jsonify(user_emotions), 200


# ===================================================
# WEEKLY TREND + EMOTIONAL PROFILE SUMMARY
# ===================================================
@app.route("/api/emotions/insights", methods=["GET"])
@token_required
def get_emotion_insights(current_user):
    emotions_col = db["emotions"]
    records = list(
        emotions_col.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1).limit(5)
    )

    if not records:
        return jsonify({
            "dominant_emotion": "None",
            "stability": "No Data",
            "average_intensity": 0,
        })

    # Dominant Emotion
    emotion_list = [r["emotion"] for r in records]
    dominant_emotion = Counter(emotion_list).most_common(1)[0][0]

    # Intensity Calculation
    intensities = [r.get("intensity", 50) for r in records]
    avg_intensity = round(sum(intensities) / len(intensities))

    # Stability Based on Emotional Variance
    unique_emotions = len(set(emotion_list))
    if unique_emotions <= 2:
        stability = "Stable"
    elif unique_emotions <= 4:
        stability = "Balanced"
    else:
        stability = "Fluctuating"

    return jsonify({
        "dominant_emotion": dominant_emotion,
        "stability": stability,
        "average_intensity": avg_intensity
    }), 200

# ---------------------------
# 🎯 DECISION LAB – COGNITIVE DECISION ENGINE (Advanced)
# ---------------------------
import json
from collections import Counter

@app.route("/api/decision/analyze", methods=["POST"])
@token_required
def analyze_decision(current_user):
    data = request.get_json() or {}
    question = (data.get("question") or "").strip()

    if not question:
        return jsonify({"error": "Question is required"}), 400

    # --- Gather user context ---
    user_doc = users.find_one({"_id": current_user["_id"]})
    cognitive_profile = user_doc.get("cognitive_profile", {})
    learning_styles = user_doc.get("learning_styles", [])
    subjects = user_doc.get("subjects", [])

    # --- Recent emotion summary (last 10) ---
    emotions_col = db["emotions"]
    recent = list(emotions_col.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1).limit(10))
    dominant_emotion = None
    avg_intensity = None
    emotional_summary = {}
    if recent:
        emotion_names = [r.get("emotion") for r in recent if r.get("emotion")]
        dominant_emotion = Counter(emotion_names).most_common(1)[0][0] if emotion_names else None
        intensities = [r.get("intensity", 50) for r in recent]
        avg_intensity = round(sum(intensities) / len(intensities)) if intensities else None

        # aggregate ai scores if present
        focus_scores = []
        stress_scores = []
        motivation_scores = []
        for r in recent:
            ai = r.get("ai") or {}
            if isinstance(ai, dict):
                if ai.get("focus_score") is not None:
                    focus_scores.append(ai.get("focus_score"))
                if ai.get("stress_score") is not None:
                    stress_scores.append(ai.get("stress_score"))
                if ai.get("motivation_score") is not None:
                    motivation_scores.append(ai.get("motivation_score"))

        emotional_summary = {
            "dominant_emotion": dominant_emotion,
            "avg_intensity": avg_intensity,
            "focus_avg": round(sum(focus_scores)/len(focus_scores)) if focus_scores else None,
            "stress_avg": round(sum(stress_scores)/len(stress_scores)) if stress_scores else None,
            "motivation_avg": round(sum(motivation_scores)/len(motivation_scores)) if motivation_scores else None
        }
    else:
        emotional_summary = {
            "dominant_emotion": None,
            "avg_intensity": None,
            "focus_avg": None,
            "stress_avg": None,
            "motivation_avg": None
        }

    # --- Build a deterministic prompt that includes user context ---
    prompt = f"""
You are an expert decision advisor that tailors decisions to a student's cognitive profile and emotional state.
Return STRICT JSON only.

User question: "{question}"

User context:
- Name: {user_doc.get('name')}
- Email: {user_doc.get('email')}
- Learning styles: {learning_styles}
- Subjects: {subjects}
- Cognitive profile: {json.dumps(cognitive_profile)}
- Recent emotion summary: {json.dumps(emotional_summary)}

Respond with a JSON object with the following keys:
- final_decision: string (direct concise recommendation)
- rationale: string (concise explanation of reasoning)
- confidence_score: integer (0-100)
- bias_detected: string or null (e.g., "Overconfidence", "Loss aversion", null)
- risk_level: "low"|"medium"|"high"
- cognitive_alignment: string (how well this decision fits user's cognitive style)
- emotional_influence: string (how current emotions might bias or affect this decision)
- short_term_effect: string
- long_term_effect: string
- action_steps: array of short actionable steps (strings)

Keep answers concise and practical.
"""

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.25,
            max_tokens=800
        )

        msg = completion.choices[0].message
        if isinstance(msg.content, list):
            response_text = "".join(block.text if hasattr(block, "text") else str(block) for block in msg.content)
        else:
            response_text = msg.content

        cleaned = response_text.replace("```json", "").replace("```", "").strip()

        # Try parse JSON safely
        parsed = {}
        try:
            parsed = json.loads(cleaned)
        except Exception as e:
            print("Decision JSON parse error:", e)
            # fallback minimal structure
            parsed = {
                "final_decision": cleaned[:1000],
                "rationale": "",
                "confidence_score": 50,
                "bias_detected": None,
                "risk_level": "medium",
                "cognitive_alignment": "",
                "emotional_influence": "",
                "short_term_effect": "",
                "long_term_effect": "",
                "action_steps": []
            }

        # Normalize fields (ensure keys exist)
        result = {
            "final_decision": parsed.get("final_decision", "") or "",
            "rationale": parsed.get("rationale", "") or "",
            "confidence_score": int(parsed.get("confidence_score", 50) or 50),
            "bias_detected": parsed.get("bias_detected", None),
            "risk_level": parsed.get("risk_level", "medium"),
            "cognitive_alignment": parsed.get("cognitive_alignment", "") or "",
            "emotional_influence": parsed.get("emotional_influence", "") or "",
            "short_term_effect": parsed.get("short_term_effect", "") or "",
            "long_term_effect": parsed.get("long_term_effect", "") or "",
            "action_steps": parsed.get("action_steps", []) or []
        }

        # Save decision record for learning
        decisions_col = db["decisions"]
        decisions_col.insert_one({
            "user_id": str(current_user["_id"]),
            "question": question,
            "result": result,
            "raw_ai": cleaned,
            "timestamp": datetime.datetime.utcnow()
        })

        return jsonify(result), 200

    except Exception as e:
        print("Decision Engine Error:", e)
        return jsonify({"error": "AI failed to generate a response"}), 500


# ---------------------------
# GET PAST DECISIONS (for UI)
# ---------------------------
@app.route("/api/decisions", methods=["GET"])
@token_required
def list_decisions(current_user):
    decisions_col = db["decisions"]
    docs = list(decisions_col.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1).limit(50))
    out = []
    for d in docs:
        out.append({
            "id": str(d.get("_id")),
            "question": d.get("question"),
            "result": d.get("result", {}),
            "timestamp": d.get("timestamp").strftime("%Y-%m-%d %H:%M:%S") if d.get("timestamp") else None
        })
    return jsonify(out), 200


# ---------------------------
# COURSE SYSTEM — with Cognitive Learning Engine
# ---------------------------
from statistics import mean
from collections import Counter

def compute_course_progress(course):
    weights = {
        "lessons": 0.40,
        "modules": 0.25,
        "labs": 0.15,
        "assessments": 0.20,
    }

    counts = {
        "lessons": len(course.get("lessons", [])),
        "modules": len(course.get("modules", [])),
        "labs": len(course.get("labs", [])),
        "assessments": len(course.get("assessments", [])),
    }

    present = {k: v for k, v in weights.items() if counts[k] > 0}
    if not present:
        return 0

    total_nominal = sum(present.values())
    adjusted = {k: weights[k] / total_nominal for k in present}

    def pct(arr):
        if not arr:
            return 0
        done = sum(1 for x in arr if x.get("completed"))
        return done / len(arr)

    lessons_pct = pct(course.get("lessons", []))
    modules_pct = pct(course.get("modules", []))
    labs_pct = pct(course.get("labs", []))

    assessments = course.get("assessments", [])
    if assessments:
        total = sum(a.get("score", 0) for a in assessments)
        max_total = sum(a.get("max_score", 1) for a in assessments)
        assessments_pct = total / max_total if max_total else 0
    else:
        assessments_pct = 0

    progress = (
        lessons_pct * adjusted.get("lessons", 0) +
        modules_pct * adjusted.get("modules", 0) +
        labs_pct * adjusted.get("labs", 0) +
        assessments_pct * adjusted.get("assessments", 0)
    )

    return round(progress * 100)

# ---------------------------
# Cognitive learning helpers (per-course)
# ---------------------------
def compute_learning_load(course):
    """Estimate Learning Load Index (LLI) from counts and total items."""
    lessons = len(course.get("lessons", []))
    modules = len(course.get("modules", []))
    labs = len(course.get("labs", []))
    assessments = len(course.get("assessments", []))

    # simple heuristic: more items => higher load
    nominal = lessons + modules*2 + labs*1.5 + assessments*2.5
    # normalize to 0..100 (tweak scale if needed)
    lli = min(100, round(nominal * 5))  # each unit ~5 points
    return lli

def compute_skill_mastery(course):
    """Skill Mastery Index from assessment scores and lesson completions."""
    assessments = course.get("assessments", [])
    lessons = course.get("lessons", [])

    # assessments: average score% (if present)
    if assessments:
        total = sum((a.get("score") or 0) for a in assessments)
        max_total = sum((a.get("max_score") or 100) for a in assessments)
        assess_pct = (total / max_total) * 100 if max_total else 0
    else:
        assess_pct = 0

    # lessons completion %
    if lessons:
        done = sum(1 for l in lessons if l.get("completed"))
        lessons_pct = (done / len(lessons)) * 100
    else:
        lessons_pct = 0

    # weighted mastery
    smi = round((assess_pct * 0.6) + (lessons_pct * 0.4))
    return max(0, min(100, smi))

def compute_memory_retention(course):
    """Memory Retention Score — favors recent completions and assessment recency.
       If timestamps are not stored, fallback to progress-based approximation."""
    # If you later add timestamps to lesson completions, use recency decay.
    progress = course.get("progress_percent", 0)
    # retention approx: higher progress -> better retained but saturates
    mrs = round(min(100, progress * 0.9 + 10))
    return mrs

def compute_fatigue_for_user_course(user_id, course):
    """Cognitive fatigue: combines learning load and user's recent stress signals for this course."""
    lli = compute_learning_load(course)

    # fetch user's recent stress from emotions and weigh it
    emotions_col = db["emotions"]
    recent = list(emotions_col.find({"user_id": str(user_id)}).sort("timestamp", -1).limit(15))
    if recent:
        stress_scores = [ (e.get("ai") or {}).get("stress_score") for e in recent ]
        stress_scores = [s for s in stress_scores if s is not None]
        stress_avg = round(mean(stress_scores)) if stress_scores else 50
    else:
        stress_avg = 50

    # fatigue heuristic: higher LLI and higher stress => higher fatigue
    fatigue = round((lli * 0.6) + (stress_avg * 0.4))
    return max(0, min(100, fatigue))

def course_recommendation(course, lli, fatigue, smi, mrs):
    """Return simple actionable recommendation for this course."""
    if fatigue > 75:
        return "High fatigue — consider short breaks and reduce new study load."
    if smi < 50 and mrs < 50:
        return "Revise recent lessons and attempt a short quiz to reinforce memory."
    if lli > 70 and smi > 75:
        return "Load is high but mastery is strong — schedule spaced repetition."
    if smi >= 80:
        return "Strong mastery — try advanced problems or accelerate modules."
    return "Keep steady — 30–40 min focused sessions with short breaks."

# ---------------------------
# CREATE COURSE
# ---------------------------
@app.route("/api/courses", methods=["POST"])
@token_required
def create_course(current_user):
    data = request.get_json() or {}
    title = data.get("title")
    code = data.get("code")
    semester = data.get("semester")

    if not title or not code:
        return jsonify({"error": "title and code required"}), 400

    course = {
        "user_id": str(current_user["_id"]),
        "title": title,
        "code": code,
        "semester": semester or "",
        "lessons": [],
        "modules": [],
        "labs": [],
        "assessments": [],
        "created_at": datetime.datetime.utcnow()
    }

    course["progress_percent"] = compute_course_progress(course)

    result = courses_col.insert_one(course)
    course["_id"] = str(result.inserted_id)
    return jsonify(course), 201

# ---------------------------
# GET ALL COURSES (with cognitive insights)
# ---------------------------
@app.route("/api/courses", methods=["GET"])
@token_required
def list_courses(current_user):
    uid = str(current_user["_id"])
    output = []
    for c in courses_col.find({"user_id": uid}):
        c["_id"] = str(c["_id"])
        # ensure progress is up-to-date
        c["progress_percent"] = compute_course_progress(c)

        # compute cognitive metrics
        lli = compute_learning_load(c)
        smi = compute_skill_mastery(c)
        mrs = compute_memory_retention(c)
        fatigue = compute_fatigue_for_user_course(uid, c)
        recommendation = course_recommendation(c, lli, fatigue, smi, mrs)

        c["lli"] = lli
        c["smi"] = smi
        c["mrs"] = mrs
        c["fatigue"] = fatigue
        c["recommendation"] = recommendation

        output.append(c)
    return jsonify(output), 200

# ---------------------------
# GET SINGLE COURSE
# ---------------------------
@app.route("/api/courses/<cid>", methods=["GET"])
@token_required
def get_course(current_user, cid):
    try:
        course = courses_col.find_one({"_id": ObjectId(cid)})
    except:
        return jsonify({"error": "Invalid id"}), 400

    if not course or str(course["user_id"]) != str(current_user["_id"]):
        return jsonify({"error": "Course not found"}), 404

    course["_id"] = str(course["_id"])
    course["progress_percent"] = compute_course_progress(course)
    # add insights for single view as well
    lli = compute_learning_load(course)
    smi = compute_skill_mastery(course)
    mrs = compute_memory_retention(course)
    fatigue = compute_fatigue_for_user_course(str(current_user["_id"]), course)
    course["lli"] = lli
    course["smi"] = smi
    course["mrs"] = mrs
    course["fatigue"] = fatigue
    course["recommendation"] = course_recommendation(course, lli, fatigue, smi, mrs)

    return jsonify(course), 200

# ---------------------------
# DELETE COURSE
# ---------------------------
@app.route("/api/courses/<cid>", methods=["DELETE"])
@token_required
def delete_course(current_user, cid):
    try:
        course = courses_col.find_one({"_id": ObjectId(cid)})
    except:
        return jsonify({"error": "Invalid id"}), 400

    if not course or str(course["user_id"]) != str(current_user["_id"]):
        return jsonify({"error": "Course not found"}), 404

    courses_col.delete_one({"_id": ObjectId(cid)})
    return jsonify({"message": "Deleted"}), 200

# ---------------------------
# ADD LESSON (updates progress & insights)
# ---------------------------
@app.route("/api/courses/<cid>/lesson", methods=["PUT"])
@token_required
def add_lesson(current_user, cid):
    title = request.json.get("title")
    if not title:
        return jsonify({"error": "title required"}), 400

    item = {"_id": str(ObjectId()), "title": title, "completed": False}
    courses_col.update_one({"_id": ObjectId(cid)}, {"$push": {"lessons": item}})
    course = courses_col.find_one({"_id": ObjectId(cid)})
    courses_col.update_one({"_id": ObjectId(cid)}, {"$set": {"progress_percent": compute_course_progress(course)}})
    course["_id"] = str(course["_id"])
    # update insights could happen here or lazily on next list/get
    return jsonify(course), 200

# ============================================================
# ✔ UNIVERSAL TOGGLE COMPLETION (Lessons, Modules, Labs)
# URL: /api/courses/<cid>/<section>/<item_id>/toggle
# ============================================================
@app.route("/api/courses/<cid>/<section>/<item_id>/toggle", methods=["POST"])
@token_required
def toggle_course_item(current_user, cid, section, item_id):
    valid_sections = ["lesson", "module", "lab"]
    plural_map = {"lesson": "lessons", "module": "modules", "lab": "labs"}

    if section not in valid_sections:
        return jsonify({"error": "Invalid section"}), 400

    plural = plural_map[section]

    course = courses_col.find_one({"_id": ObjectId(cid)})
    if not course or course["user_id"] != str(current_user["_id"]):
        return jsonify({"error": "Course not found"}), 404

    items = course.get(plural, [])
    updated = False

    for item in items:
        if item["_id"] == item_id:
            item["completed"] = not item.get("completed", False)
            updated = True
            break

    if not updated:
        return jsonify({"error": f"{section.capitalize()} not found"}), 404

    # Save updated list
    courses_col.update_one(
        {"_id": ObjectId(cid)},
        {"$set": {plural: items}}
    )

    # Recalculate progress
    updated_course = courses_col.find_one({"_id": ObjectId(cid)})
    updated_course["progress_percent"] = compute_course_progress(updated_course)
    courses_col.update_one(
        {"_id": ObjectId(cid)},
        {"$set": {"progress_percent": updated_course["progress_percent"]}}
    )

    updated_course["_id"] = str(updated_course["_id"])
    return jsonify(updated_course), 200


# ---------------------------
# 🏠 Root Endpoint
# ---------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "NeuroLink backend is running"}), 200


if __name__ == "__main__":
    app.run(debug=True)
