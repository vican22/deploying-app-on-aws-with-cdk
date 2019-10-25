import json
import logging
import os
from http import HTTPStatus

import boto3
from botocore.exceptions import ClientError

LOG = logging.getLogger()
LOG.setLevel(logging.INFO)


def lambda_handler(request: dict, _context) -> dict:
    """
    Put the received request item into DynamoDB request table
    :param request: Request to be put into DynamoDB table
    :param _context: context for this handler (ignored)
    :return: response from the DynamoDB PutItem operation
    """
    if request and request["body"]:
        request_body = json.loads(request["body"])

        if "id" not in request_body:
            LOG.error(
                f"Partition key 'id' missing from request - {request_body['id']}")
            return process_response(HTTPStatus.BAD_REQUEST, request)

        LOG.info(f"New request received - {request_body['id']}")
        try:
            insert_request_body(request_body)
        except ClientError as err:
            LOG.error(
                f"Error encountered putting request in DynamoDB - {request_body['id']}")
            return process_response(HTTPStatus.INTERNAL_SERVER_ERROR, err)

        LOG.info(
            f"Successfully put request in DynamoDB - {request_body['id']}")
        return process_response(HTTPStatus.OK, {})


def insert_request_body(request_body: dict) -> dict:
    """
    Insert request body into DynamoDB request table
    :param request_body: Request body to be put into DynamoDB
    :return: response from DynamoDB PutItem operation
    """
    try:
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table(os.getenv("REQUEST_TABLE"))
        return table.put_item(Item=request_body)
    except ClientError as err:
        raise err


def process_response(status_code: int, body: dict) -> dict:
    """
    process the handler's response before returning it to API Gateway
    :param status_code: numeric HTTP status code from the response
    :param body: body dictionary from the response
    :return: dictionary mapping the response properties
    """
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "isBase64Encoded": False,
        "headers": {
            "Content-Type": "application/json"
        }
    }
