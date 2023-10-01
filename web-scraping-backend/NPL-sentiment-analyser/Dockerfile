FROM python:3.9-slim-buster

WORKDIR /python-docker

COPY requirements.txt requirements.txt
COPY good_words.txt good_words.txt
COPY bad_words.txt bad_words.txt
COPY imdb_labelled.txt imdb_labelled.txt
COPY amazon_cells_labelled.txt amazon_cells_labelled.txt
COPY yelp_labelled_good.txt yelp_labelled_good.txt
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 5000

CMD [ "python3", "main.py", "-h", "0.0.0.0", "-p", "5000"]