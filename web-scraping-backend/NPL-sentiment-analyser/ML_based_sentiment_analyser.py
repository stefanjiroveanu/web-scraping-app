import pandas as pd
import tensorflow as tf
from tensorflow import keras
from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
import numpy as np

training_size = 2400
vocabulary_size = 1200

model = tf.keras.Sequential([
    tf.keras.layers.Embedding(vocabulary_size, 16, input_length=100),
    tf.keras.layers.GlobalAveragePooling1D(),
    tf.keras.layers.Dense(16, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

tokenizer = Tokenizer(num_words=vocabulary_size, oov_token="NOT_EXISTENT")


def train_model():
    dy = pd.read_csv('yelp_labelled_good.txt', sep='\t', header=None)
    da = pd.read_csv('amazon_cells_labelled.txt', sep='\t', header=None)
    di = pd.read_csv('imdb_labelled.txt', sep='\t', header=None)

    data = pd.concat([da, di, dy], ignore_index=True)

    x = data[0]
    y = data[1]

    training_sentences = x[0:training_size]
    testing_sentences = x[training_size:]
    training_values = y[0:training_size]
    testing_values = y[training_size:]

    tokenizer.fit_on_texts(training_sentences)
    word_index = tokenizer.word_index

    training_sequences = tokenizer.texts_to_sequences(training_sentences)
    training_padded = pad_sequences(training_sequences, maxlen=100)

    testing_sequences = tokenizer.texts_to_sequences(testing_sentences)
    testing_padded = pad_sequences(testing_sequences, maxlen=100)

    training_padded = np.array(training_padded)
    training_labels = np.array(training_values)
    testing_padded = np.array(testing_padded)
    testing_labels = np.array(testing_values)

    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])

    num_epochs = 50
    history = model.fit(training_padded, training_labels, epochs=num_epochs,
                        validation_data=(testing_padded, testing_labels), verbose=2)


def analyse(text):
    print(text)
    sequence = tokenizer.texts_to_sequences([text])
    padded = pad_sequences(sequence, maxlen=100)
    return model.predict(padded)


if __name__ == '__main__':
    train_model()
