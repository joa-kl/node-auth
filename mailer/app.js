const nodeMailer = require('nodemailer');

const html = `
    <h1>Hello World</h1>
    <p>Isn't NodeMailer useful?</p>
`;

async function main() {
    nodeMailer.createTransport({
        // host: 
    })
}
