# npm start

for i in {501..500}
do
  curl -X POST http://localhost:8080 -H "Content-Type: application/json" -d '{
    "data": {
      "name": "test-invoice-'$i'.pdf",
      "bucket": "paradon-ap-test",
      "contentType": "application/json",
      "metageneration": "1",
      "timeCreated": "2020-04-23T07:38:57.230Z",
      "updated": "2020-04-23T07:38:57.230Z",
      "documentType": "invoice"
    },
    "type": "google.cloud.storage.object.v1.finalized",
    "specversion": "1.0",
    "source": "//pubsub.googleapis.com/",
    "id": "1234567890"
  }' &
done

# Wait for all background jobs to finish
wait