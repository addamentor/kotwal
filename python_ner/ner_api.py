from flask import Flask, request, jsonify
import spacy

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")

@app.route('/ner', methods=['POST'])
def ner():
    data = request.get_json()
    text = data.get('text', '')
    doc = nlp(text)
    entities = [{'text': ent.text, 'label': ent.label_} for ent in doc.ents]
    return jsonify({'entities': entities})

if __name__ == '__main__':
    app.run(port=5000)