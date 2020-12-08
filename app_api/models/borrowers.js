const mongoose = require('mongoose');

const borrowerSchema = new mongoose.Schema({
    borrowerNum: String, // Date.now();
    type: String, //Member, Non-Member,
    status: String, // Basic, Pending for Review, Verified
    profile: {
        email: String,
        emailVerificationToken: String,
        emailVerified: Boolean,
        firstName: String,
        middleName: String,
        lastName: String,
        gender: String, //Male, Female
        birthday: String,
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
        // Other
        monthlyIncome: String,
        annualIncome: String,
        salaryDate: Date,
        officeAddress: String,
        officeAddressZipcode: String,
        officePhone: String,
        numOfEmployees: String,
        tenure: String,
        position: String, // Director/Officer, EVP/SVP/GM, VP/MG, Others
        companyIdFront: {
            filename: String,
            contentType: String,
            file: Binary
        },
        companyIdBack: {
            filename: String,
            contentType: String,
            file: Binary
        },
        payslip1: {
            filename: String,
            contentType: String,
            file: Binary
        },
        payslip2: {
            filename: String,
            contentType: String,
            file: Binary
        },
        underAgency: Boolean
    },
    gcashAccount: {
        name: String,
        String: String,
        proof: String
    },
    documents: {
        govIdType: String, //TIN, SSS, GSIS, UMID, Passport, Driver's License, Postal ID, Voter's ID, PRC, NBI Clearance
        primaryIdFront: {
            filename: String,
            contentType: String,
            file: Binary
        },
        primaryIdBack: {
            filename: String,
            contentType: String,
            file: Binary
        },
        selfiewithId: {
            filename: String,
            contentType: String,
            file: Binary
        },
        proofOfTIN: {
            filename: String,
            contentType: String,
            file: Binary
        }
    },
    beneficiaries: { // Members only
        bene1: {
            firstName: String,
            lastName: String,
            relationship: String,
            birthday: String
        },
        bene2: {
            firstName: String,
            lastName: String,
            relationship: String,
            birthday: String
        },
        bene3: {
            firstName: String,
            lastName: String,
            relationship: String,
            birthday: String
        },
        bene4: {
            firstName: String,
            lastName: String,
            relationship: String,
            birthday: String
        },
        bene5: {
            firstName: String,
            lastName: String,
            relationship: String,
            birthday: String
        }
    },
    employeeNum: String, // Members only
    maxLoanAmount: String, // Set by Loan Officer
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction' // Transaction of Repayments and Contributions
    }]
}, {
    timestamps: true
});

mongoose.model('Borrower', borrowerSchema);