# syntax=docker/dockerfile:1

FROM python:3.11-alpine

WORKDIR /python-docker

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 5000

CMD [ "python", "./app.py"]