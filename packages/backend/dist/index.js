"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// bridges
const sepolia_1 = __importDefault(require("./bridges/sepolia"));
const mumbai_1 = __importDefault(require("./bridges/mumbai"));
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
    (0, sepolia_1.default)();
    (0, mumbai_1.default)();
});
