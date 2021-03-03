const mongoose = require('mongoose');

const borrowerSchema = new mongoose.Schema({
    borrowerNum: String, // Date.now();
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
        email: {
            type: String,
            unique: true,
            required: true
        },
        emailVerificationToken: String,
        emailVerified: Boolean,
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
        birthday: {
            type: Date,
            required: true
        },
        civilStat: {
            type: String,
            enum: ["Single", "Married", "Widowed", "Divorced"]
        },
        dependents: String,
        educAttainment: {
            type: String,
            enum: ["High School", "Vocational/Technical", "College", "Post Graduate", "Others"]
        },
        placeOfBirth: String,
        nationality: String,
        address: {
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
            enum: ["Owned", "Living with relative", "Renting", "Others"]
        },
        monthlyHomeFee: String,
        yrsOfStay: String,
        carOwnership: {
            type: String,
            enum: ["None", "Owned"]
        },
        monthlyCarLoanPayment: String,
        homePhoneName: {
            type: String,
            enum: ["Owned", "Relative", "None", "Others"]
        },
        homePhoneNum: String,
        mobileNum: {
            type: String,
            required: true
        },
        mobileNumVerified: Boolean,
        lineType: {
            type: String,
            enum: ["Pre Paid", "Post Paid"]
        },
        mobilePhoneOs: {
            type: String,
            enum: ["Android", "iOS", "Blackberry", "Others"]
        },
        addMobileNum1: String,
        addMobileNum2: String,
        tin: String
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
        numOfEmployees: {
            type: String,
            enum: ["1-10", "11-50", "51-100", "101-500", "501~"]
        },
        tenure: Date,
        employmentType: {
            type: String,
            enum: ["Regular", "Probation", "Contractual", "Project Based", "Part-Time", "Self-Employed/Freelancer"]
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
                "Self-Employed",
                "Others"
            ]
        },
        position: {
            type: String,
            enum: ["Director/Officer", "EVP/SVP/GM", "VP/MG", "Others"]
        },
        monthlyIncome: String,
        annualIncome: String,
        salaryDate: String,
        underAgency: Boolean
    },
    gcashAccount: {
        name: String,
        number: String,
        proof: {
            filename: String,
            contentType: String,
            file: Buffer
        }
    },
    documents: {
        govIdType: {
            type: String,
            enum: ["TIN", "SSS", "GSIS", "UMID", "Passport", "Driver's License", "Postal ID", "Voter's ID", "PRC", "NBI Clearance"]
        },
        primaryIdFront: {
            filename: String,
            contentType: String,
            file: Buffer
        },
        primaryIdBack: {
            filename: String,
            contentType: String,
            file: Buffer
        },
        companyIdFront: {
            filename: String,
            contentType: String,
            file: Buffer
        },
        companyIdBack: {
            filename: String,
            contentType: String,
            file: Buffer
        },
        payslip1: {
            filename: String,
            contentType: String,
            file: Buffer
        },
        payslip2: {
            filename: String,
            contentType: String,
            file: Buffer
        },
        proofOfTIN: {
            filename: String,
            contentType: String,
            file: Buffer
        },
        selfiewithId: {
            filename: String,
            contentType: String,
            file: Buffer
        },
        signature: {
            filename: String,
            contentType: String,
            file: Buffer
        }
    },
    beneficiaries: { // Members only
        bene1: {
            firstName: String,
            lastName: String,
            relationship: {
                type: String,
                enum: ["Parent", "Sibling", "Spouse", "Child"]
            },
            birthday: Date
        },
        bene2: {
            firstName: String,
            lastName: String,
            relationship: {
                type: String,
                enum: ["Parent", "Sibling", "Spouse", "Child"]
            },
            birthday: Date
        },
        bene3: {
            firstName: String,
            lastName: String,
            relationship: {
                type: String,
                enum: ["Parent", "Sibling", "Spouse", "Child"]
            },
            birthday: Date
        },
        bene4: {
            firstName: String,
            lastName: String,
            relationship: {
                type: String,
                enum: ["Parent", "Sibling", "Spouse", "Child"]
            },
            birthday: Date
        },
        bene5: {
            firstName: String,
            lastName: String,
            relationship: {
                type: String,
                enum: ["Parent", "Sibling", "Spouse", "Child"]
            },
            birthday: Date
        }
    },
    maxLoanAmount: {
        type: String,
        default: "0.00"
    }, // Set by Loan Officer
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // Loan Officer
    },
    reviewedDate: Date,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // User account
    },
    termsandCondition: Boolean
}, {
    timestamps: true
});

mongoose.model('Borrower', borrowerSchema);