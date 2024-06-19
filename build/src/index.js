"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const locations_1 = require("../locations");
const PORT = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
const foundCities = () => {
    const cities = [];
    locations_1.locations.map((i) => {
        if (!cities.includes(i.city))
            cities.push(i.city);
    });
    return cities;
};
const foundDistricts = () => {
    const districts = [];
    locations_1.locations.map((i) => {
        if (!districts.includes(i.district))
            districts.push(i.district);
    });
    return districts;
};
// Convierte en minúscula y elimina caracteres especiales 
const strNormalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
app.get('/', (_, res) => {
    res.json(locations_1.locations);
});
app.get('/cities', (_, res) => {
    res.json(foundCities());
});
app.get('/districts', (_, res) => {
    res.json(foundDistricts());
});
app.get('/:city/districts', (req, res) => {
    const city = strNormalize(req.params.city);
    const districts = locations_1.locations.filter(location => strNormalize(location.city) === city).map(location => location.district);
    districts.length > 0 ?
        res.json(districts)
        :
            res.status(404).json({ "error": "City not found" });
});
app.get('/:city', (req, res) => {
    const city = strNormalize(req.params.city);
    const cityLocations = locations_1.locations.filter(location => strNormalize(location.city) === city);
    if (cityLocations.length > 0) {
        const totalUnits = cityLocations.reduce((sum, location) => sum + location.units, 0);
        res.json({ city: cityLocations[0].city, units: totalUnits });
    }
    else {
        res.status(404).json({ "error": 'City not found' });
    }
});
app.get('/district/:district', (req, res) => {
    const district = strNormalize(req.params.district);
    const districtUnits = locations_1.locations.find(location => strNormalize(location.district) === district);
    districtUnits ?
        res.json({ district: districtUnits.district, units: districtUnits.units })
        :
            res.status(404).json({ "error": 'District not found' });
});
app.get('/search/:query', (req, res) => {
    const query = strNormalize(req.params.query);
    let found = false;
    let rate = 0;
    let result = null;
    locations_1.locations.forEach(location => {
        const cityNormalized = strNormalize(location.city);
        if (cityNormalized.includes(query)) {
            const similarityRate = query.length / cityNormalized.length;
            if (similarityRate > rate) {
                result = {
                    found: true,
                    rate: similarityRate,
                    name: location.city,
                    type: 'CITY',
                    city: location.city
                };
                found = true;
            }
        }
        const districtNormalized = strNormalize(location.district);
        if (districtNormalized.includes(query)) {
            const similarityRate = query.length / districtNormalized.length;
            if (similarityRate > rate) {
                result = {
                    found: true,
                    rate: similarityRate,
                    name: location.district,
                    type: 'DISTRICT',
                    city: location.city
                };
                found = true;
            }
        }
    });
    if (!found) {
        result = {
            found: false,
            rate: null,
            name: null,
            type: null,
            city: null
        };
    }
    res.json(result);
});
app.use((_, res) => {
    res.status(404).json({ "error": 'Endpoint not found' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}. http://localhost:3000/`);
});
