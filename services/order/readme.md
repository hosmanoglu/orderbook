hold orderbook and execute orders  


redis docker
docker network create mynetwork
docker run -d --name redis -p 6379:6379 --network mynetwork redis
docker run -d --name redisinsight -p 5540:5540 --network mynetwork redis/redisinsight:latest

docker run -d -e RABBITMQ_DEFAULT_USER=username -e RABBITMQ_DEFAULT_PASS=password -p 15672:15672 -p 5672:5672 rabbitmq:latest
