#!/bin/bash

FILE_PATH="/Users/ryanmcguire/Downloads/test-invoices/test-invoice-332.pdf"
FILE_NAME="test-upload-1.pdf"

curl -X PUT --upload-file "$FILE_PATH" -H "Content-Type: application/pdf" "http://localhost:3000/api/extract-fields?fileName=$FILE_NAME"
