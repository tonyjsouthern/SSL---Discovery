//var express         = require('express');
const fs          = require("fs");
var sslChecker    = require('ssl-checker')
var dns           = require('dns').promises;
var Connection    = require('tedious').Connection;
var sql           = require('sequelize');
require('dotenv').config();

var config = {
	host: process.env.DB_HOST,
	port: "1433",
	dialect: "mssql",
	userName: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
};

var query = process.env.DB_QUERY;

var customerArray;

async function getCustomerCnames() {
	var connection = await new sql(config.database, config.userName, config.password, config);
	connection = connection;
	await connection.query(query).spread((results) => {
		customerArray = results;
		console.log("Total customers to check: " + results.length);
	})
}

async function init() {
	await checkResults();
	await getCustomerCnames();
	await loopCustomers();
}

async function checkSSL(domain) {
	return sslChecker(domain)
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log(error);
		});
}

async function runDnsResolve(domain) {
	try {
		var result = await dns.resolveCname(domain);
		if (result[0] == 'hostssl.msgapp.com' || result[0] == 'eu.hostssl.msgapp.com') {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
}

function writeData(resultSet) {
	return fs.appendFileSync("results.txt", resultSet, (err) => {
		if (err) throw err;
	});
}

function convertDate(d) {
	var parts = d.split(" ");
	if (parts[1] == '') {
		return parts[0] + "-" + parts[2] + "-" + parts[4];
	} else {
		return parts[0] + "-" + parts[1] + "-" + parts[3];
	}
}

async function loopCustomers() {
	for (const customer of customerArray) {
		try {
			var resolved = await runDnsResolve(customer.hostedlink)
			if (resolved == true) {
				var results = await sslChecker(customer.hostedlink)
				var stringData = customer.customername.replace(/,/g, '') + "," + customer.customer_id + "," + convertDate(results.valid_from) + "," + convertDate(results.valid_to) + "," + results.days_remaining + "\n";
				await writeData(stringData)
			}
			console.log(await "Ran check on customer " + customer.customername + ": " + resolved + ".");
		} catch (e) {
		}
	}
}

function checkResults() {
    fs.readFile('./Results.txt', function(err, data) {
        if (data) {
            return fs.unlink('Results.txt', function(err) {
                console.log('Results.txt deleting and generating new results file.');
            });
        } else {
            return
        };
    });
}

init();
