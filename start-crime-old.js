function get_best_crime(){

	crimes =['shoplift', 'mug', 'traffick arms', 'kidnap', 'assassinate', 'heist'];

	bestcrime = crimes[0];

	for (i= 0; i < crimes.length ; i++){

		if (getCrimeChance(crimes[i]) === 1){

			bestcrime = crimes[i];

		}

	}

	return bestcrime;

}





crime = get_best_crime();

print('Commiting crimes '+crime);



counter = 0;

while(true){

	while (isBusy() === false){

		commitCrime(crime);

		counter += 1;

		if (counter == 20){

		    crime = get_best_crime();

		    counter = 0;

		    print('Giving a chance to kill script');

	        sleep(15000);

		}

	}

	

}