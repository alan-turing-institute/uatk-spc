***File to prep TUS data to match SPENSER data
**** Download data from UKDS
**** Professor Karyn Morrissey
**** Department of Management, DTU, Denmark
*****


use "/Users/karynmorrissey/Documents/COVID2021/msm_england/TUS201415_PSM.dta", clear

rename tuspid pid


gen fid    = tushid 
sort fid 
by fid: egen hhnssec = max(nssec8)

*rename tuspid pid
gen pid1 = _n
gen hid = .
gen area = .
gen hhref = .
gen treatment = 0

gen gender = 0 if sex == 2
replace gender = 1 if gender == .
drop sex
rename gender Sex

*Age1 = 1: 8-15
*Age1 = 2: 16-19
*Age1 = 3: 20-29
*Age1 = 4: 30-44
*Age1 = 5: 45-59
*Age1 = 6: 60-74
*Age1 = 7: 75+ 

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

	
gen hhnssec5 = 0
replace hhnssec5 = 1 if hhnssec == 1|hhnssec == 2
replace hhnssec5 = 2 if hhnssec == 3
replace hhnssec5 = 3 if hhnssec == 4
replace hhnssec5 = 4 if hhnssec == 5
replace hhnssec5 = 5 if hhnssec == 6|hhnssec== 7
replace hhnssec5 = 99 if hhnssec == 0|hhnssec == 8|hhnssec == 9

keep pid hid Sex Age1 area treatment pid1    hhref hhnssec5 
save "/Users/karynmorrissey/Documents/COVID2021/msm_england/tus_prep_2021.dta", replace
