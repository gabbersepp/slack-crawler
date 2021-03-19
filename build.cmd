CD client
CALL docker build -t gabbersepp/slack-crawler-web .
CALL docker push gabbersepp/slack-crawler-web

CD ../messageHandler
CALL docker build -t gabbersepp/slack-crawler .
CALL docker push gabbersepp/slack-crawler

CD ../postprocess
CALL docker build -t gabbersepp/slack-crawler-postprocess .
CALL docker push gabbersepp/slack-crawler-postprocess

CD ../server
CALL docker build -t gabbersepp/slack-crawler-api .
CALL docker push gabbersepp/slack-crawler-api

CD ../k8s
CALL kubectl delete -f .\k8s.yaml
CALL kubectl apply -f .\k8s.yaml