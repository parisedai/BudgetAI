from flask import Flask, render_template, request, redirect

app = Flask(__name__)

# Temporary storage for MVP
expenses = []

@app.route("/")
def home():
    return render_template("index.html", expenses=expenses)

@app.route("/add", methods=["POST"])
def add_expense():
    item = request.form['item']
    amount = float(request.form['amount'])
    category = request.form['category']

    # Add to temporary list
    expenses.append({
        "item": item,
        "amount": amount,
        "category": category
    })

    return redirect("/")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

