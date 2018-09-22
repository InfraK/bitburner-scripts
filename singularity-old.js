function gym_workout(a,b){
    gymWorkout(a,b);
}

function study_hacking(){
	travel('Volhaven');
	while(get_stats().hacking < 50){
		universityCourse('ZB Institute of Technology', 'Algorithms');
		sleep(10000);
	}
	
}
function gym_routine(){
	travel('Sector-12');
	while(get_stats().strength < 300){
		gym_workout('Powerhouse Gym', 'str');
		sleep(10000);
	}
	while(get_stats().defense < 300){
		gym_workout('Powerhouse Gym', 'def');
		sleep(10000);
	}
	while(get_stats().dexterity < 300){
		gym_workout('Powerhouse Gym', 'dex');
		sleep(10000);
	}
	while(get_stats().agility < 300){
		gym_workout('Powerhouse Gym', 'agi');
		sleep(10000);
	}

}
function travel(s){
    travelToCity(s);
}
function get_stats(){
	return getStats();
}
//print('Studying hacking');
//study_hacking();
print('Going to the gym');
gym_routine();
//crime = get_best_crime();
//print('Commiting crimes '+crime);
commitCrime('shoplift');
//run('start_crime.script');
/*counter = 0;
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
	
}*/