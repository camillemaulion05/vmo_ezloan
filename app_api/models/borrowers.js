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
    }, // Basic, Complete/Processing, Verified
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
        educAttainment: String, //High School, Vocational/Technical, College, Post Graduate, Others
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
        homeOwnership: String, //Owned, Living with relative, Renting, Others
        monthlyHomeFee: String,
        yrsOfStay: String,
        carOwnership: String, // None, Owned
        monthlyCarLoanPayment: String,
        homePhoneName: String, // Owned, Relative, None, Other
        homePhoneNum: String,
        mobileNum: String,
        mobileNumVerified: Boolean,
        lineType: String, // Pre Paid, Post Paid
        mobilePhoneOs: String, // Android, iOS, Blackberry, Others
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
        numOfEmployees: String,
        tenure: Date,
        employmentType: String, //Regular, Probation, Contractual, Project Based, Part-Time, Self-Employed, Freelancer
        businessType: String,
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
        occupationType: String,
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
        position: String, // Director/Officer, EVP/SVP/GM, VP/MG, Others
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