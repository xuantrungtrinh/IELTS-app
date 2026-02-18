from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json

    hashed_pw = generate_password_hash(data["password"])

    user = User(
        username=data["username"],
        email=data["email"],
        password=hashed_pw
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    # kiểm tra email + password:
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
                    "message": "Login successful",
                    "token": access_token
                    })

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    return jsonify({"user_id": user_id})