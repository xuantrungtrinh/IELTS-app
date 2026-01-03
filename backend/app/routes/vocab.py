# from flask import Blueprint, jsonify
# from ..models import Vocabulary
#
# vocab_bp = Blueprint("vocab", __name__, url_prefix="/api/vocab")
#
# @vocab_bp.route("/", methods=["GET"])
# def get_vocab():
#     words = Vocabulary.query.all()
#     return jsonify([
#         {"word": w.word, "meaning": w.meaning, "topic": w.topic}
#         for w in words
#     ])

from flask import Blueprint, jsonify, request
from app.models import Question
from app.extensions import db

vocab_bp = Blueprint("vocab", __name__)

# GET: lấy toàn bộ vocab
# @vocab_bp.route("/vocab", methods=["GET"])
# def get_vocab():
#     questions = Question.query.all()
#
#     return jsonify([
#         {
#             "id": q.id,
#             "question": q.text,
#             "answer": q.answer
#         }
#         for q in questions
#     ])
@vocab_bp.route("/vocab", methods=["GET"])
def get_vocab():
    # 1️⃣ Lấy query params
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=5, type=int)
    topic = request.args.get("topic")  # 👈 string
    q = request.args.get("q")

    query = Question.query

    # ✅ FILTER THEO TOPIC (STRING)
    if topic:
        query = query.filter(Question.topic == topic)

    if q:
        query = query.filter(Question.text.ilike(f"%{q}%"))

    # 2️⃣ Query database (có pagination)
    pagination = query.order_by(Question.id.desc()).paginate(
        page=page,
        per_page=limit,
        error_out=False
    )

    # 3️⃣ Format dữ liệu
    items = []
    for q in pagination.items:
        items.append({
            "id": q.id,
            "question": q.text,
            "topic": q.topic,
            "answer": q.answer
        })

    # 4️⃣ Trả JSON chuẩn
    return jsonify({
        "items": items,
        "page": page,
        "limit": limit,
        "total": pagination.total,
        "pages": pagination.pages
    })

# POST: thêm vocab mới
@vocab_bp.route("/vocab", methods=["POST"])
def create_vocab():
    data = request.get_json()

    # 1. kiểm tra dữ liệu
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    question_text = data.get("question")
    answer_text = data.get("answer")
    topic = data.get("topic")

    if not question_text or not answer_text:
        return jsonify({
            "error": "Both 'question' and 'answer' are required"
        }), 400

    if not isinstance(question_text, str) or not isinstance(answer_text, str):
        return jsonify({
            "error": "'question' and 'answer' must be strings"
        }), 400

    # 2. tạo object Question
    new_question = Question(
        text=question_text.strip(),
        answer=answer_text.strip(),
        topic=topic
    )

    # 3. lưu vào database
    db.session.add(new_question)
    db.session.commit()

    # 4. trả kết quả
    return jsonify({
        # "message": "Vocab created successfully",
        "id": new_question.id,
        "question": new_question.text,
        "answer": new_question.answer,
        "topic": new_question.topic
    }), 201

# # UPDATE:
# @vocab_bp.route("/vocab/<int:vocab_id>", methods=["PUT"])
# def update_vocab(vocab_id):
#     data = request.get_json()
#
#     if not data:
#         return jsonify({"error": "Missing JSON body"}), 400
#
#     question = Question.query.get(vocab_id)
#
#     if question is None:
#         return jsonify({"error": "Vocab not found"}), 404
#
#     # cập nhật nếu có gửi lên
#     if "question" in data:
#         if not isinstance(data["question"], str) or not data["question"].strip():
#             return jsonify({"error": "Invalid question"}), 400
#         question.text = data["question"].strip()
#
#     if "answer" in data:
#         if not isinstance(data["answer"], str) or not data["answer"].strip():
#             return jsonify({"error": "Invalid answer"}), 400
#         question.answer = data["answer"].strip()
#
#     db.session.commit()
#
#     return jsonify({
#         "id": question.id,
#         "question": question.text,
#         "answer": question.answer
#     })

# PUT: update vocab
@vocab_bp.route("/vocab/<int:vocab_id>", methods=["PUT"])
def update_vocab(vocab_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data"}), 400

    question = data.get("question")
    answer = data.get("answer")
    topic = data.get("topic")

    if not question or not answer:
        return jsonify({
            "error": "Both 'question' and 'answer' are required"
        }), 400

    vocab = Question.query.get_or_404(vocab_id)

    vocab.text = question.strip()
    vocab.answer = answer.strip()

    if "topic" in data:
        vocab.topic = topic

    db.session.commit()

    return jsonify({
        "id": vocab.id,
        "question": vocab.text,
        "answer": vocab.answer,
        "topic": vocab.topic
    })

# DELETE:
@vocab_bp.route("/vocab/<int:vocab_id>", methods=["DELETE"])
def delete_vocab(vocab_id):
    question = Question.query.get(vocab_id)

    if question is None:
        return jsonify({"error": "Vocab not found"}), 404

    db.session.delete(question)
    db.session.commit()

    return jsonify({"message": "Deleted"})
