getIP = async () => {
    const data = await fetch('http://www.geoplugin.net/json.gp');
    console.log(await data.json());
}
try {
    getIP();
} catch (error) {
    console.error(error);
}

