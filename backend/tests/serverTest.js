const app = require('../server');

setTimeout(async () => {
  try {
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    console.log('✅ Server Health Check:', healthData);

    const depRes = await fetch('http://localhost:5000/api/departments');
    const depData = await depRes.json();
    console.log(`✅ Departments Loaded: ${depData.count} departments`);

    const docRes = await fetch('http://localhost:5000/api/doctors');
    const docData = await docRes.json();
    console.log(`✅ Doctors Loaded: ${docData.count} active doctors`);

    process.exit(0);
  } catch (err) {
    console.error('Server Test Failed:', err);
    process.exit(1);
  }
}, 2000);
