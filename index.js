const dns = require('dns');
const https = require('https');

const domain = process.env.CDMON_DOMAIN;
const username = process.env.CDMON_USERNAME;
const password = process.env.CDMON_PASSWORD;
const interval = process.env.CDMON_INTERVAL || 30 * 60 * 1000;

function parseCdmonResponse(rawData) {
  const data = rawData.split('&');
  const response = {};
  for (var i = 0; i < data.length; i++) {
    const property = data[i];
    if (property.length > 0 & property.includes('=')) {
      const tuple = property.split('=');
      response[tuple[0]] = tuple[1];
    }
  }
  return response;
}

function getCurrentIp(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, currentIp) => {
      if (err) {
        reject(err);
      } else {
        resolve(currentIp);
      }
    });
  });
}

function getCdmonData(username, password) {
  return new Promise((resolve, reject) => {
    https.get(`https://dinamico.cdmon.org/onlineService.php?enctype=MD5&n=${username}&p=${password}`, res => {
      if (res.statusCode === 200) {
        try {
          res.setEncoding('utf8');
          let rawData = '';
          res.on('data', (chunk) => { rawData += chunk; });
          res.on('end', () => {
            const response = parseCdmonResponse(rawData);
            if (response.resultat === 'guardatok') {
              resolve(response);
            } else {
              reject(response);
            }
          });
        } catch (err) {
          reject(err);
        }
      } else {
        reject(res.statusCode);
      }
    });
  });
}

function setCdmonData(username, password, currentip) {
  return new Promise((resolve, reject) => {
    https.get(`https://dinamico.cdmon.org/onlineService.php?enctype=MD5&n=${username}&p=${password}&cip=${currentip}`, res => {
      if (res.statusCode === 200) {
        try {
          res.setEncoding('utf8');
          let rawData = '';
          res.on('data', (chunk) => { rawData += chunk; });
          res.on('end', () => {
            const response = parseCdmonResponse(rawData);
            if (response.resultat === 'customok') {
              resolve(response);
            } else {
              reject(response);
            }
          });
        } catch (err) {
          reject(err);
        }
      } else {
        reject(res.statusCode);
      }
    });
  });
}

function updateIp() {
  if (!domain) {
    console.error('Missing domain');
    return;
  }
  if (!username) {
    console.error('Missing username');
    return;
  }
  if (!password) {
    console.error('Missing password');
    return;
  }
  console.log(domain, username, password);

  getCurrentIp(domain).then(currentIp => {
    console.log('Current ip:', currentIp);
    return getCdmonData(username, password).then(cdmonData => {
      console.log('Getting data:', cdmonData);
      if (cdmonData.newip !== currentIp) {
        return setCdmonData(username, password, cdmonData.newip).then(cdmonData => {
          console.log('Updating data:', cdmonData);
        });
      }
    });
  })
  .catch(err => {
    console.error(err);
  })
}

console.log('Daemon started');

updateIp();
const task = setInterval(updateIp, interval);

process.on('exit', code => {
  console.log('Daemon stopped');
  clearInterval(task);
});