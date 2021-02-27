const mongoose = require('mongoose');

const borrowerSchema = new mongoose.Schema({
    borrowerNum: String, // Date.now();
    type: {
        type: String,
        default: "Non-Member"
    }, //Member, Non-Member
    status: {
        type: String,
        default: "Basic"
    }, // Basic, Complete, Verified
    profile: {
        email: String,
        emailVerificationToken: String,
        emailVerified: Boolean,
        firstName: String,
        middleName: String,
        lastName: String,
        gender: String, //Male, Female
        birthday: Date,
        civilStat: String, //Single, Married, Widowed, Divorced
        dependents: String,
        educAttainment: String, //High School, Vocational/Technical, College, Post Graduate
        placeOfBirth: String,
        address: {
            present: {
                address: String,
                city: String,
                zipCode: String
            },
            permanent: {
                address: String,
                city: String,
                zipCode: String
            }
        },
        homeOwnership: String, //Owned, Living with relative, Renting, Others
        monthlyRentHomeLoanPayment: String,
        yrsOfStay: String,
        carOwnership: String, // None, Owned
        monthlyCarLoanPayment: String,
        homePhoneName: String, // Owned, Relative, None, Other
        homePhoneNum: String,
        mobileNum: String,
        mobileNumVerified: Boolean,
        lineType: String, // Pre Paid, Post Paid
        mobilePhoneOs: String, // Android, iOS, Blackberry
        addMobileNum1: String,
        addMobileNum2: String,
        tin: String
    },
    workBusinessInfo: {
        employmentType: String, //Regular, Probation, Contractual, Project Based, Part-Time, Self-Employed, Freelancer
        companyName: String,
        department: String,
        companyIndustry: String,
        // BPO/Communications/IT/Mass Media,
        // Retail Sale/Restaurant/Hotel/Tourism/Other Service,
        // Transportation/Shipping/Real Estate,
        // Bank/Insurance/Finance,
        // Government,
        // Construction/Marker/Manufacturing,
        // Trading/Export/Import/Wholesale,
        // Electric/Gas/Waterworks,
        // Medical/Education/School,
        // Security,
        // Agriculture/Forestry/Fisheries/Mining, 
        // Others
        occupationalType: String,
        // Management,
        // Marketing,
        // Sales,
        // Office Worker,
        // Professional/Technical,
        // Service/Reception,
        // Production Worker/Labor,
        // Security/Guard/Maid,
        // Driver,
        // Self-Employed,
        // Others
        monthlyIncome: String,
        annualIncome: String,
        salaryDate: String,
        officeAddress: String,
        officeAddressZipcode: String,
        officePhone: String,
        numOfEmployees: String,
        tenure: String,
        position: String, // Director/Officer, EVP/SVP/GM, VP/MG, Others
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
        govIdType: String, //TIN, SSS, GSIS, UMID, Passport, Driver's License, Postal ID, Voter's ID, PRC, NBI Clearance
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
        selfiewithId: {
            filename: String,
            contentType: String,
            file: Buffer
        },
        proofOfTIN: {
            filename: String,
            contentType: String,
            file: Buffer
        }
    },
    beneficiaries: { // Members only
        bene1: {
            firstName: String,
            lastName: String,
            relationship: String,
            birthday: Date
        },
        bene2: {
            firstName: String,
            lastName: String,
            relationship: String,
            birthday: Date
        },
        bene3: {
            firstName: String,
            lastName: String,
            relationship: String,
            birthday: Date
        },
        bene4: {
            firstName: String,
            lastName: String,
            relationship: String,
            birthday: Date
        },
        bene5: {
            firstName: String,
            lastName: String,
            relationship: String,
            birthday: Date
        }
    },
    employeeNum: String, // Members only
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
    }
}, {
    timestamps: true
});

mongoose.model('Borrower', borrowerSchema);