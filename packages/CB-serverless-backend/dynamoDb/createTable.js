var AWS = require('aws-sdk');
var indexOf = require('lodash/indexOf');
const chalk = require('chalk');

// Configure the AWS to lookup the right server and endpoint for DynamoDB
// In case of local set endpoint to localhost
AWS.config.update({
  region: 'ap-south-1',
  endpoint: 'http://localhost:8000',
});

var dynamodb = new AWS.DynamoDB();
/* Delete Tables */
const getDeleteParams = (tableName) => ({
  TableName: tableName
});

const createGroceryTable = () => {
  var groceryParams = {
    TableName: 'grocery',
    KeySchema: [
      { AttributeName: 'groceryId', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
			{ AttributeName: 'groceryId', AttributeType: 'S' },
			{ AttributeName: 'category', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 2,
      WriteCapacityUnits: 2
		},
		GlobalSecondaryIndexes: [
			{
				IndexName: 'GroceryCategoryIndex',
				KeySchema: [
					{ AttributeName: 'category', KeyType: 'HASH' },
					{ AttributeName: 'groceryId', KeyType: 'RANGE' },
				],
				Projection: {
					ProjectionType: 'ALL'
				},
				ProvisionedThroughput: {
					ReadCapacityUnits: 2,
					WriteCapacityUnits: 2
				},
			}
		]
  };
  return dynamodb.createTable(groceryParams).promise();
};

const createOrderTable = () => {
  var orderParams = {
    TableName: 'orders',
    KeySchema: [
			{ AttributeName: 'userId', KeyType: 'HASH'},			
			{ AttributeName: 'orderId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
			{ AttributeName: 'orderId', AttributeType: 'S' },
			{ AttributeName: 'userId', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 2,
      WriteCapacityUnits: 2
    }
  }
  
  return dynamodb.createTable(orderParams).promise();
}

const createCartTable = () => {
  var userParams = {
    TableName: 'cart',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [Î
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 2,
      WriteCapacityUnits: 2
    }
  }
  
  return dynamodb.createTable(userParams).promise();
}
let tables;

const listTables = dynamodb.listTables({}).promise();

listTables
  .then((data, err) => {
    let groceryTablePromise, userTablePromise, orderTablePromise;

    groceryTablePromise = (indexOf(data.TableNames, 'grocery') === -1) ? createGroceryTable() : Promise.resolve();
    userTablePromise = (indexOf(data.TableNames, 'cart') === -1) ? createCartTable() : Promise.resolve();
    orderTablePromise = (indexOf(data.TableNames, 'order') === -1) ? createOrderTable() : Promise.resolve();
      
    return Promise.all([groceryTablePromise, userTablePromise, orderTablePromise]);
  })
  .then(() => {
    console.log(chalk.green('Created Tables Successfully'));
  })
  .catch((e) => {
    console.log(chalk.red('Could not create tables. Reason: ', e.message))
  })