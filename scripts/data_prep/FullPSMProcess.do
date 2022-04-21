**** Full PSM process to match SPENSER with HSE and TUS data
**** See Prep files for HSE and TUS data
**** Professor Karyn Morrissey
**** Department of Management, DTU, Denmark
*****


local i=1

	while `i'<= 324 {
insheet using "/Users/karynmorrissey/Documents/COVID2021/msm_england/Individuals/File_ind_`i'.csv", clear
drop if hid == -1
sort hid
save    "/Users/karynmorrissey/Documents/COVID2021/msm_england/File_ind_`i'.dta", replace
local i=`i'+1
}


*** Preparing Household files
local i=1
	
	while `i'<= 324 {
insheet using "/Users/karynmorrissey/Documents/COVID2021/msm_england/households/File_hh_`i'.csv", clear
order area hid hrpid
rename	lc4605_c_nssec	nssec
rename lc4404_c_sizhuk11 hhsize


sort hid 
save    "/Users/karynmorrissey/Documents/COVID2021/msm_england/File_hh_`i'.dta", replace
local i=`i'+1
}

**** merge ind + hh
*******************

local i=1	
	while `i'<= 324 {
use "/Users/karynmorrissey/Documents/COVID2021/msm_england/File_ind_`i'.dta", clear
sort hid 
merge hid using "/Users/karynmorrissey/Documents/COVID2021/msm_england/File_hh_`i'.dta"

keep if _merge == 3
drop if hid == -1

order area hid pid
gen hhref = 1 if hrpid == pid
rename dc1117ew_c_age age
drop if age < 16 & hhref == 1
gen hhnssec = nssec
***Dropping hh where children assigned hhref

rename dc1117ew_c_sex Sex 

replace Sex = 0 if Sex == 2
replace Sex = 1 if Sex == 1



gen Age35g = 0
	 replace Age35g = 1 if age == 0|age == 1 
	 replace Age35g = 2 if age == 2| age == 3|age == 4
	 replace Age35g = 3 if age == 5| age == 6|age == 7
	 replace Age35g = 4 if age == 8| age == 9|age == 10 
	 replace Age35g = 5 if age == 11| age == 12 
	 replace Age35g = 6 if age == 13| age == 14|age == 15 
	 replace Age35g = 7 if age == 16| age == 17| age ==    18|age == 19
	 replace Age35g = 8 if age == 20| age == 21|age == 22 |age == 23|age == 24
	 replace Age35g = 9 if age == 25| age == 26|age == 27 |age == 28|age == 29
	 replace Age35g = 10 if age == 30| age == 31|age == 32 |age == 33|age == 34
	 replace Age35g = 11 if age == 35| age == 36|age == 37 |age == 38|age == 39
	 replace Age35g = 12 if age == 40| age == 41|age == 42 |age == 43|age == 44
	 replace Age35g = 13 if age == 45| age == 46|age == 47 |age == 48|age == 49
	 replace Age35g = 14 if age == 50| age == 51|age == 52 |age == 53|age == 54
	 replace Age35g = 15 if age == 55| age == 56|age == 57 |age == 58|age == 59
	 replace Age35g = 16 if age == 60| age == 61|age == 62 |age == 63|age == 64
	 replace Age35g = 17 if age == 65| age == 66|age == 67 |age == 68|age == 69
	 replace Age35g = 18 if age == 70| age == 71|age == 72 |age == 73|age == 74
	 replace Age35g = 19 if age == 75| age == 76|age == 77 |age == 78|age == 79
	 replace Age35g = 20 if age == 80| age == 81|age == 82 |age == 83|age == 84
	 replace Age35g = 21 if age >= 85
	 
	 rename Age35g Age

gen Age1 = 1 if Age >= 1 & Age <= 6
replace Age1 = 2 if Age == 7
replace Age1 = 3 if Age >= 8 & Age <= 9
replace Age1 = 4 if Age >= 10 & Age <= 12
replace Age1 = 5 if Age >= 13 & Age <= 15
replace Age1 = 6 if Age >= 16 & Age <= 18
replace Age1 = 7 if Age >= 19


rename dc2101ew_c_ethpuk11 ethnicity
gen Origin = 0
replace Origin = 1 if ethnicity == 2|ethnicity == 3|ethnicity == 4
replace Origin = 2 if ethnicity == 7
replace Origin = 3 if ethnicity == 6
replace Origin = 4 if ethnicity == 5
replace Origin = 5 if ethnicity == 8


replace hhnssec = 99 if hhnssec == 9
*** NSSEC8 -    NSSEC5
gen hhnssec5 = 1 if hhnssec == 1|hhnssec == 2
replace hhnssec5 = 2 if hhnssec == 3
replace hhnssec5 = 3 if hhnssec == 4
replace hhnssec5 = 4 if hhnssec == 5
replace hhnssec5 = 5 if hhnssec == 6|hhnssec == 7
replace hhnssec5 = 99 if hhnssec == 8|hhnssec == 10|hhnssec == 9
replace hhnssec5 = 99 if hhnssec5 == .


*For the PSM process you need to have a treatment group and a control group. The Spenser data is the treatment group ‚Äì so a category called treatment is generated.
gen treatment = 1

*Keep adult (over 16) population

order area hid pid
keep pid area Sex Age1 Origin hid treatment hhref hhnssec5 age 


save "/Users/karynmorrissey/Documents/COVID2021/msmengland/treatment_lad_`i'.dta", replace
local i=`i'+1
}


*******
 *** PSM TUS
 *******
local i=1	
	while `i'<= 324 {	
	use "/Users/karynmorrissey/Documents/COVID2021/msm_england/treatment_lad_`i'.dta", clear
	append using "/Users/karynmorrissey/Documents/COVID2021/msm_england/tus_prep_2021.dta", force
	
	save "/Users/karynmorrissey/Documents/COVID2021/msm_england/appended_lad_`i'.dta", replace

	psmatch2 treatment Sex Age1 hhnssec5, k(normal) out(treatment Sex Age1 hhnssec5)	
	
	save "/Users/karynmorrissey/Documents/COVID2021/msm_england/PSM_TUS_`i'.dta", replace

	use "/Users/karynmorrissey/Documents/COVID2021/msm_england/PSM_TUS_`i'.dta", clear
	keep if treatment == 0
	gen long pid_tus = pid
	sort _pscore
	save "/Users/karynmorrissey/Documents/COVID2021/msm_england/treatment0_lad_`i'.dta", replace
	
	use "/Users/karynmorrissey/Documents/COVID2021/msm_england/PSM_TUS_`i'.dta", clear
	keep if treatment == 1
	sort    _pscore
	merge _pscore using "/Users/karynmorrissey/Documents/COVID2021/msm_england/treatment0_lad_`i'.dta"
	tab _merge
	
	keep if _merge == 3
	
	order area hid pid pid_tus
	drop treatment-_merge
	sort pid_tus
	save "/Users/karynmorrissey/Documents/COVID2021/msm_england/matched_lad_`i'.dta", replace
local i=`i'+1
}


*****
	*** Match the Census and TUS datasets
	*****
local i=1	
	while `i'<= 324 {		
	use "/Users/karynmorrissey/Documents/COVID2021/msm_england/TUS_time_shares_keyworker.dta", clear
	gen long pid_tus = pid
	sort pid_tus
	merge pid_tus using "/Users/karynmorrissey/Documents/COVID2021/msm_england/matched_lad_`i'.dta"
	
	
	keep if _merge == 3
	drop _merge

	order area hid pid 
	sort area hid pid
	rename unitgroup soc2010
	keep area hid pid pid_tus Sex Age1 age hhnssec5 nssec5 pwkstat health soc2010 sic2d07 p*    sic1d07-sicg07 occupationtitle-keyworkeroccupationgroupcasa
	sort area hid pid_tus
	drop psu pid
	order area hid pid_tus Sex Age1 age hhnssec5 

save "/Users/karynmorrissey/Documents/COVID2021/msm_england/lad_TUS_`i'.dta", replace
export delimited using "/Users/karynmorrissey/Documents/COVID2021/msm_england/lad_TUS_`i'.txt", replace
	
local i=`i'+1
}


*******
 *** PSM - HSE
 *******
	
	local i=1	
	while `i'<= 324 {	
	use "/Users/karynmorrissey/Documents/COVID2021/msm_england/treatment_lad_1.dta", clear
	append using "/Users/karynmorrissey/Documents/COVID2021/msm_england/hse_prep.dta", force
	
	
	psmatch2 treatment Sex Age1 hhnssec5 , k(normal) out(treatment Sex Age1    hhnssec5) 
	
	save "/Users/karynmorrissey/Documents/COVID2021/msm_england/PSM_HSE_1.dta", replace

	use "/Users/karynmorrissey/Documents/COVID2021/msm_england/PSM_HSE_1.dta", clear
	keep if treatment == 0
	gen long pid_hse = pid
	sort _pscore
	save "/Users/karynmorrissey/Documents/COVID2021/msm_england/treatment0_lad_1.dta", replace
	
	use "/Users/karynmorrissey/Documents/COVID2021/msm_england/PSM_HSE_1.dta", clear
	keep if treatment == 1
	sort    _pscore

	merge _pscore using "/Users/karynmorrissey/Documents/COVID2021/msm_england/treatment0_lad_1.dta"
	
	tab _merge
	
	keep if _merge == 3
	order area hid pid pid_hse
	drop _pscore-_merge treatment
	sort pid_hse
	save "/Users/karynmorrissey/Documents/COVID2021/msm_england/hse_match_1.dta", replace
local i=`i'+1
}	

	
	*****
*** Match spatial msim + HSE the datasets
*****
	local i=1	
	while `i'<= 324 {		
use "/Users/karynmorrissey/Documents/COVID2021/msm_england/hse_match_`i'.dta", clear
order area hid pid pid_hse
sort pid_hse
merge pid_hse using "/Users/karynmorrissey/Documents/COVID2021/msm_england/hse17i_eul_v1.dta"
tab _merge
keep if _merge == 3

gen obese40 = 1 if BMIvg6 == 6
replace obese40 = 0 if obese40 == .
	
gen underlining = 0
replace underlining = 1 if cvddef1 == 1
replace underlining = 1 if diabete2r == 1
replace underlining = 1 if bp1 == 1
replace underlining = 1 if obese40 == 1
replace underlining = 1 if complst4 == 1 
replace underlining = 1 if complst10 == 1


gen cvd = 1 if cvddef1 == 1
replace cvd = 0 if cvd ==.

gen diabetes = 1 if diabete2r == 1
replace diabetes = 0 if diabetes ==.


gen bloodpressure = 1 if bp1 == 1
replace bloodpressure = 0 if bloodpressure == .


gen smoke = 1 if SmokPl1 == 0| SmokPl1==1
replace smoke = 0 if smoke == .

keep area pid hid pid_hse Origin hhnssec5 Sex Age1 underlining GenHelf BMIvg6 cvd diabetes bloodpressure obese40 smoke nssec5

sort area hid 
drop if pid == .
sort area hid pid
save "/Users/karynmorrissey/Documents/COVID2021/msm_england/lad_HSE_`i'.dta", replace
local i=`i'+1
}



	local i=1	
	while `i'<= 324 {
use "/Users/karynmorrissey/Documents/COVID2021/msm_england/lad_TUS_`i'.dta", clear
sort area hid pid
merge using "/Users/karynmorrissey/Documents/COVID2021/msm_england/lad_HSE_`i'.dta"

tab _merge

keep if _merge == 3
*drop _merge psu agecat sex GenHelf
drop _merge
order area hid pid pid_hse pid_tus Sex age Age1


save "/Users/karynmorrissey/Documents/COVID2021/msm_england/lad_tus_hse_`i'.dta", replace
export delimited using "/Users/karynmorrissey/Documents/COVID2021/msm_england/lad_tus_hse_`i'.txt", replace
local i=`i'+1
}
