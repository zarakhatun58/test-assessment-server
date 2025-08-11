"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Level = exports.Competency = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var Competency;
(function (Competency) {
    Competency["COMPUTER_BASICS"] = "Computer Basics";
    Competency["INTERNET_USAGE"] = "Internet Usage";
    Competency["EMAIL_COMMUNICATION"] = "Email Communication";
    Competency["WORD_PROCESSING"] = "Word Processing";
    Competency["SPREADSHEETS"] = "Spreadsheets";
    Competency["PRESENTATIONS"] = "Presentations";
    Competency["DATABASE_MANAGEMENT"] = "Database Management";
    Competency["CYBERSECURITY"] = "Cybersecurity";
    Competency["DIGITAL_CONTENT_CREATION"] = "Digital Content Creation";
    Competency["CLOUD_COMPUTING"] = "Cloud Computing";
    Competency["PROGRAMMING_FUNDAMENTALS"] = "Programming Fundamentals";
    Competency["NETWORKING"] = "Networking";
    Competency["DATA_ANALYSIS"] = "Data Analysis";
    Competency["SOFTWARE_INSTALLATION"] = "Software Installation";
    Competency["MOBILE_DEVICES"] = "Mobile Devices";
    Competency["ONLINE_COLLABORATION"] = "Online Collaboration";
    Competency["DIGITAL_ETHICS"] = "Digital Ethics";
    Competency["TROUBLESHOOTING"] = "Troubleshooting";
    Competency["MULTIMEDIA_EDITING"] = "Multimedia Editing";
    Competency["WEB_DEVELOPMENT"] = "Web Development";
    Competency["PROJECT_MANAGEMENT"] = "Project Management";
    Competency["ARTIFICIAL_INTELLIGENCE"] = "Artificial Intelligence";
})(Competency || (exports.Competency = Competency = {}));
var Level;
(function (Level) {
    Level["A1"] = "A1";
    Level["A2"] = "A2";
    Level["B1"] = "B1";
    Level["B2"] = "B2";
    Level["C1"] = "C1";
    Level["C2"] = "C2";
})(Level || (exports.Level = Level = {}));
const QuestionSchema = new mongoose_1.Schema({
    competency: { type: String, enum: Object.values(Competency), required: true },
    level: { type: String, enum: Object.values(Level), required: true },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Question', QuestionSchema);
//# sourceMappingURL=Question.js.map