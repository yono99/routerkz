docker stop routerkz
docker rm routerkz
docker build -t routerkz .
docker run -d --name routerkz -p 20128:20128 --env-file .env -v routerkz-data:/app/data routerkz