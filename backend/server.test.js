const http = require("http");

function testServer() {
    const options = {
        host: "localhost",
        port: 3000,
        path: "/",
        timeout: 2000
    };

    const req = http.request(options, res => {
        console.log("Test Passed ✅");
        process.exit(0);
    });

    req.on("error", err => {
        console.error("Test Failed ❌");
        process.exit(1);
    });

    req.end();
}

testServer();
