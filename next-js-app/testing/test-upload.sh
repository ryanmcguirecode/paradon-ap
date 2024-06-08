#!/bin/bash

for i in {1..100}
do
  FILE_PATH="/Users/ryanmcguire/Downloads/test-invoices/test-invoice-$i.pdf"
  FILE_NAME="test-invoice-$i.pdf"

  curl -X PUT --upload-file "$FILE_PATH" -H "Content-Type: application/pdf" "http://localhost:3000/api/upload?fileName=$FILE_NAME"
done