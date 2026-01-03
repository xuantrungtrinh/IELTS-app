from app.extensions import db

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    answer = db.Column(db.String(255), nullable=False)

    topic = db.Column(db.String(50))

    def __repr__(self):
        return f"<Question {self.text}>"


