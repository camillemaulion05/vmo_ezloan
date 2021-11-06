const mongoose = require('mongoose');

const borrowerSchema = mongoose.Schema({
    borrowerNum: String, // Date.now();
    isDeleted: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: "Non-Member",
        enum: ["Non-Member", "Member"]
    },
    status: {
        type: String,
        default: "Basic",
        enum: ["Basic", "Pending for Review", "Verified", "Declined"]
    },
    profile: {
        firstName: {
            type: String,
            required: true
        },
        middleName: String,
        lastName: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female"]
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        maritalStat: {
            type: String,
            enum: ["Single", "Married", "Widow/er", "Legally Seperated", "Annuled"]
        },
        dependents: String,
        educAttainment: {
            type: String,
            enum: ["High School", "Vocational/Technical", "College", "Post Graduate", "Others"]
        },
        placeOfBirth: String,
        nationality: String,
        address: {
            sameAddress: Boolean,
            present: {
                unitNo: String,
                houseNo: String,
                street: String,
                subdivision: String,
                barangay: String,
                city: String,
                province: String,
                zipCode: String
            },
            permanent: {
                unitNo: String,
                houseNo: String,
                street: String,
                subdivision: String,
                barangay: String,
                city: String,
                province: String,
                zipCode: String
            }
        },
        homeOwnership: {
            type: String,
            enum: ["Owned", "Rented/Boarder", "Living with Parents/Relatives", "Others"]
        },
        homePhoneNum: String,
        mobileNum: {
            type: String,
            required: true,
            unique: true
        },
        mobileNumVerified: {
            type: Boolean,
            default: false
        },
        tin: String,
        email: {
            type: String,
            required: true,
            unique: true
        },
        emailVerificationToken: String,
        emailVerified: {
            type: Boolean,
            default: false
        },
        nameOfSpouse: String //For Members Only
    },
    workBusinessInfo: {
        companyName: String,
        department: String,
        officePhone: String,
        officeAddress: {
            unitNo: String,
            houseNo: String,
            street: String,
            subdivision: String,
            barangay: String,
            city: String,
            province: String,
            zipCode: String
        },
        dateHired: Date,
        employmentType: {
            type: String,
            enum: ["Regular", "Probation", "Contractual", "Project Based", "Part-Time", "Self-Employed/Freelancer"]
        },
        occupationType: {
            type: String,
            enum: [
                "Management",
                "Marketing",
                "Sales",
                "Office Worker",
                "Professional/Technical",
                "Service/Reception",
                "Production Worker/Labor",
                "Security/Guard/Maid",
                "Driver",
                "Self Employee/Freelance",
                "Others"
            ]
        },
        businessType: {
            type: String,
            enum: [
                "BPO/Communications/IT/Mass Media",
                "Retail Sale/Restaurant/Hotel/Tourism/Other Service",
                "Transportation/Shipping/Real Estate",
                "Bank/Insurance/Finance",
                "Government",
                "Construction/Marker/Manufacturing",
                "Trading/Export/Import/Wholesale",
                "Electric/Gas/Waterworks",
                "Medical/Education/School",
                "Security",
                "Agriculture/Forestry/Fisheries/Mining",
                "Others"
            ]
        },
        position: {
            type: String,
            enum: ["Director/Executive", "Supervisor", "Officer", "Staff", "None"]
        },
        monthlyIncome: String,
    },
    employeeID: String, //For Members Only
    account: {
        name: {
            type: String,
            unique: true
        },
        number: {
            type: String,
            unique: true
        }
    },
    signature: String,
    documents: {
        primaryIdFront: {
            originalname: String,
            filename: String,
            contentType: String,
            uploaded: Date
        },
        primaryIdBack: {
            originalname: String,
            filename: String,
            contentType: String,
            uploaded: Date
        },
        companyIdFront: {
            originalname: String,
            filename: String,
            contentType: String,
            uploaded: Date
        },
        companyIdBack: {
            originalname: String,
            filename: String,
            contentType: String,
            uploaded: Date
        },
        coe: {
            originalname: String,
            filename: String,
            contentType: String,
            uploaded: Date
        },
        payslip1: {
            originalname: String,
            filename: String,
            contentType: String,
            uploaded: Date
        },
        payslip2: {
            originalname: String,
            filename: String,
            contentType: String,
            uploaded: Date
        },
        bir: {
            originalname: String,
            filename: String,
            contentType: String,
            uploaded: Date
        },
        tinProof: {
            originalname: String,
            filename: String,
            contentType: String,
            uploaded: Date
        },
        selfiewithId: {
            originalname: String,
            filename: String,
            contentType: String,
            uploaded: Date
        }
    },
    additionalDocuments: [{
        name: String,
        originalname: String,
        filename: String,
        contentType: String
    }],
    beneficiaries: {
        fullName1: String,
        relationship1: String,
        dateOfBirth1: Date,
        fullName2: String,
        relationship2: String,
        dateOfBirth2: Date,
        fullName3: String,
        relationship3: String,
        dateOfBirth3: Date,
        fullName4: String,
        relationship4: String,
        dateOfBirth4: Date,
        fullName5: String,
        relationship5: String,
        dateOfBirth5: Date,
    }, //For Members Only
    totalCreditLimit: {
        type: String,
        default: "0.00"
    }, // Set by Loan Officer
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // Loan Officer
    },
    reviewedDate: Date,
    hrCertifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // HRD Authorized Officer
    }, //For Members Only
    hrCertifiedDate: Date, //For Members Only
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // User account
    },
    sharesPerPayDay: {
        type: String,
        default: "0.00"
    }, // default: "300.00" For Members Only
    patronageRefund: [{
        year: String,
        amount: {
            type: String,
            default: "0.00"
        } //For Members Only
    }],
    dividend: [{
        year: String,
        amount: {
            type: String,
            default: "0.00"
        } //For Members Only
    }]
}, {
    timestamps: true
});

mongoose.model('Borrower', borrowerSchema);