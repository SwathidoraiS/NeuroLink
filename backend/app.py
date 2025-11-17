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
CORS(app)

# Secret key for JWT
app.config["SECRET_KEY"] = os.getenv("JWT_SECRET", "neuro_secret_key")

# ---------------------------
# 🧩 MongoDB Connection
# ---------------------------
try:
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client["nuerolink_db"]
    users = db["users"]
    courses_col = db["courses"]   # <-- added for course module
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
# 🧠 AUTH ROUTES (unchanged)
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
        if key in data and data[key] is not None:
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
# 🎓 DASHBOARD (unchanged)
# ---------------------------
@app.route("/api/dashboard", methods=["GET"])
@token_required
def get_dashboard_data(current_user):
    return jsonify({
        "user": {
            "name": current_user.get("name"),
            "email": current_user.get("email")
        },
        "stats": {
            "completedCourses": 3,
            "activeCourses": 2,
            "avgScore": 87,
            "focusLevel": 78,
            "emotionScore": 82
        },
        "recentPerformance": [
            {"day": "Mon", "score": 75},
            {"day": "Tue", "score": 80},
            {"day": "Wed", "score": 85},
            {"day": "Thu", "score": 90},
            {"day": "Fri", "score": 88}
        ],
        "courses": [
            {"name": "Data Structures", "progress": 85},
            {"name": "Web Development", "progress": 70},
            {"name": "Database Systems", "progress": 95}
        ]
    }), 200


# ---------------------------
# ❤️ EMOTION TRACKER ROUTES (WORKING VERSION)
# ---------------------------

@app.route("/api/emotions", methods=["POST"])
@token_required
def add_emotion(current_user):
    data = request.get_json() or {}
    emotion = data.get("emotion")
    intensity = data.get("intensity", 50)

    if not emotion:
        return jsonify({"error": "Emotion is required"}), 400

    emotions_col = db["emotions"]
    emotions_col.insert_one({
        "user_id": str(current_user["_id"]),
        "emotion": emotion,
        "intensity": intensity,
        "timestamp": datetime.datetime.utcnow()
    })

    return jsonify({"message": "Emotion recorded successfully"}), 201


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

    return jsonify(user_emotions), 200


@app.route("/api/emotions/summary", methods=["GET"])
@token_required
def get_emotion_summary(current_user):
    emotions_col = db["emotions"]
    records = list(
        emotions_col.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1).limit(20)
    )

    if not records:
        return jsonify({
            "stability": "No data",
            "dominant_emotion": None,
            "average_intensity": 0
        }), 200

    emotion_counts = {}
    total_intensity = 0

    for e in records:
        emotion = e["emotion"]
        intensity = e.get("intensity", 50)
        total_intensity += intensity
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

    dominant_emotion = max(emotion_counts, key=emotion_counts.get)
    avg_intensity = round(total_intensity / len(records))

    variety = len(emotion_counts)
    if variety <= 2:
        stability = "Stable"
    elif variety <= 4:
        stability = "Balanced"
    else:
        stability = "Fluctuating"

    return jsonify({
        "stability": stability,
        "dominant_emotion": dominant_emotion,
        "average_intensity": avg_intensity
    }), 200
# ---------------------------
# 🎯 DECISION LAB – AI POWERED
# ---------------------------
@app.route("/api/decision/analyze", methods=["POST"])
@token_required
def analyze_decision(current_user):
    data = request.get_json() or {}
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "Question is required"}), 400

    try:
        prompt = f"""
        A student is asking an academic or career doubt.

        Question: "{question}"

        Respond in STRICT JSON ONLY:

        {{
            "answer": "...",
            "pros": ["..."],
            "cons": ["..."],
            "recommendation": "..."
        }}
        """

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        # --- Extract message safely ---
        msg = completion.choices[0].message
        if isinstance(msg.content, list):
            response_text = "".join(
                block.text if hasattr(block, "text") else str(block)
                for block in msg.content
            )
        else:
            response_text = msg.content

        # --- CLEAN RESPONSE ---
        cleaned = (
            response_text.replace("```json", "")
            .replace("```", "")
            .replace("json", "")
            .strip()
        )

        # --- SAFE JSON PARSE ---
        import json
        parsed = {
            "answer": "",
            "pros": [],
            "cons": [],
            "recommendation": ""
        }

        try:
            data_json = json.loads(cleaned)

            parsed["answer"] = data_json.get("answer", "")
            parsed["pros"] = data_json.get("pros", [])
            parsed["cons"] = data_json.get("cons", [])
            parsed["recommendation"] = data_json.get("recommendation", "")

        except Exception as e:
            print("JSON PARSE ERROR:", e)
            parsed["answer"] = cleaned   # fallback raw text

        return jsonify(parsed), 200

    except Exception as e:
        print("GROQ ERROR:", e)
        return jsonify({"error": "AI failed to generate a response"}), 500

# ============================================================
# ⭐⭐⭐ COURSE SYSTEM STARTS HERE (ONLY NEW PART) ⭐⭐⭐
# ============================================================

def compute_course_progress(course):
    """
    Same weighting system:
      lessons 40%
      modules 25%
      labs 15%
      assessments 20%
    """
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


def ensure_owner(course, user):
    return str(course["user_id"]) == str(user["_id"])


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
# GET ALL COURSES
# ---------------------------
@app.route("/api/courses", methods=["GET"])
@token_required
def list_courses(current_user):
    uid = str(current_user["_id"])
    output = []
    for c in courses_col.find({"user_id": uid}):
        c["_id"] = str(c["_id"])
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

    if not course or not ensure_owner(course, current_user):
        return jsonify({"error": "Course not found"}), 404

    course["_id"] = str(course["_id"])
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

    if not course or not ensure_owner(course, current_user):
        return jsonify({"error": "Course not found"}), 404

    courses_col.delete_one({"_id": ObjectId(cid)})
    return jsonify({"message": "Deleted"}), 200


# ---------------------------
# ADD ITEMS (LESSON / MODULE / LAB / ASSESSMENT)
# ---------------------------
def add_item(cid, field, item):
    courses_col.update_one({"_id": ObjectId(cid)}, {"$push": {field: item}})
    course = courses_col.find_one({"_id": ObjectId(cid)})
    new = compute_course_progress(course)
    courses_col.update_one({"_id": ObjectId(cid)}, {"$set": {"progress_percent": new}})
    return courses_col.find_one({"_id": ObjectId(cid)})


@app.route("/api/courses/<cid>/lesson", methods=["PUT"])
@token_required
def add_lesson(current_user, cid):
    try:
        course = courses_col.find_one({"_id": ObjectId(cid)})
    except:
        return jsonify({"error": "Invalid id"}), 400

    if not course or not ensure_owner(course, current_user):
        return jsonify({"error": "Course not found"}), 404

    title = request.json.get("title")
    if not title:
        return jsonify({"error": "title required"}), 400

    item = {"_id": str(ObjectId()), "title": title, "completed": False}
    updated = add_item(cid, "lessons", item)
    updated["_id"] = str(updated["_id"])
    return jsonify(updated), 200


@app.route("/api/courses/<cid>/module", methods=["PUT"])
@token_required
def add_module(current_user, cid):
    title = request.json.get("title")
    if not title:
        return jsonify({"error": "title required"}), 400
    item = {"_id": str(ObjectId()), "title": title, "completed": False}
    updated = add_item(cid, "modules", item)
    updated["_id"] = str(updated["_id"])
    return jsonify(updated), 200


@app.route("/api/courses/<cid>/lab", methods=["PUT"])
@token_required
def add_lab(current_user, cid):
    title = request.json.get("title")
    if not title:
        return jsonify({"error": "title required"}), 400
    item = {"_id": str(ObjectId()), "title": title, "completed": False}
    updated = add_item(cid, "labs", item)
    updated["_id"] = str(updated["_id"])
    return jsonify(updated), 200


@app.route("/api/courses/<cid>/assessment", methods=["PUT"])
@token_required
def add_assessment(current_user, cid):
    title = request.json.get("title")
    max_score = request.json.get("max_score", 100)
    if not title:
        return jsonify({"error": "title required"}), 400
    item = {
        "_id": str(ObjectId()),
        "title": title,
        "score": None,
        "max_score": max_score
    }
    updated = add_item(cid, "assessments", item)
    updated["_id"] = str(updated["_id"])
    return jsonify(updated), 200


# ---------------------------
# TOGGLE COMPLETION (LESSON / MODULE / LAB)
# ---------------------------
def toggle_item(cid, array_name, item_id):
    course = courses_col.find_one({"_id": ObjectId(cid)})
    arr = course[array_name]
    for i, item in enumerate(arr):
        if item["_id"] == item_id:
            arr[i]["completed"] = not arr[i].get("completed", False)
            break
    courses_col.update_one({"_id": ObjectId(cid)}, {"$set": {array_name: arr}})
    new = compute_course_progress(course)
    courses_col.update_one({"_id": course["_id"]}, {"$set": {"progress_percent": new}})
    return courses_col.find_one({"_id": course["_id"]})


@app.route("/api/courses/<cid>/lesson/<lid>/toggle", methods=["POST"])
@token_required
def toggle_lesson_item(current_user, cid, lid):
    updated = toggle_item(cid, "lessons", lid)
    updated["_id"] = str(updated["_id"])
    return jsonify(updated), 200


@app.route("/api/courses/<cid>/module/<mid>/toggle", methods=["POST"])
@token_required
def toggle_module_item(current_user, cid, mid):
    updated = toggle_item(cid, "modules", mid)
    updated["_id"] = str(updated["_id"])
    return jsonify(updated), 200


@app.route("/api/courses/<cid>/lab/<labid>/toggle", methods=["POST"])
@token_required
def toggle_lab_item(current_user, cid, labid):
    updated = toggle_item(cid, "labs", labid)
    updated["_id"] = str(updated["_id"])
    return jsonify(updated), 200


# ---------------------------
# UPDATE ASSESSMENT SCORE
# ---------------------------
@app.route("/api/courses/<cid>/assessment/<aid>", methods=["POST"])
@token_required
def update_assessment_score(current_user, cid, aid):
    score = request.json.get("score")
    max_score = request.json.get("max_score")

    if score is None:
        return jsonify({"error": "score required"}), 400

    course = courses_col.find_one({"_id": ObjectId(cid)})
    arr = course["assessments"]

    for i, a in enumerate(arr):
        if a["_id"] == aid:
            a["score"] = score
            if max_score:
                a["max_score"] = max_score
            break

    courses_col.update_one({"_id": ObjectId(cid)}, {"$set": {"assessments": arr}})
    new = compute_course_progress(course)
    courses_col.update_one({"_id": course["_id"]}, {"$set": {"progress_percent": new}})

    updated = courses_col.find_one({"_id": course["_id"]})
    updated["_id"] = str(updated["_id"])
    return jsonify(updated), 200


# ---------------------------
# COURSE PROGRESS
# ---------------------------
@app.route("/api/courses/<cid>/progress", methods=["GET"])
@token_required
def get_progress(current_user, cid):
    course = courses_col.find_one({"_id": ObjectId(cid)})
    if not course:
        return jsonify({"error": "Course not found"}), 404

    progress = compute_course_progress(course)
    courses_col.update_one({"_id": ObjectId(cid)}, {"$set": {"progress_percent": progress}})
    return jsonify({"course_id": cid, "progress_percent": progress}), 200


# ---------------------------
# 🏠 Root Endpoint
# ---------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "NeuroLink backend is running"}), 200


if __name__ == "__main__":
    app.run(debug=True)
