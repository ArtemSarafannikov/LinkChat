FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install -r requirements.txt

COPY LinkChat/ /app/


RUN python3 manage.py makemigrations
RUN python3 manage.py migrate
RUN python3 manage.py collectstatic --noinput

EXPOSE 8000

# Запускаем сервер через Daphne
CMD ["daphne", "-p", "8000", "--bind", "0.0.0.0", "linkchat.asgi:application"]
