from flask import Flask, jsonify, request
from ML_based_sentiment_analyser import train_model, analyse
from simple_sentiment_analyser import simple_analyse
import os



class FlaskIntializerApp(Flask):
    def run(self, host=None, port=None, debug=None, load_dotenv=None, **options):
        if not self.debug:
            with self.app_context():
                train_model()
        super(FlaskIntializerApp, self).run(host=host, port=port, debug=debug, load_dotenv=load_dotenv, **options)

app = FlaskIntializerApp("Sentiment Analyser")



@app.post("/sentiment/simple")
def simple_sentiment():
    text = request.get_json()['text']
    return jsonify(simple_analyse(text))


@app.post("/sentiment")
def ml_sentiment():
    text = request.get_json()['text']
    return jsonify(analyse(text).tolist()[0][0])


if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0", port=5000)