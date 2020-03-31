
import { DateTime } from 'luxon';

export interface DailyData {
	date: DateTime;
	cases: number;
}

export interface CountryData {
	country: string;
	data: DailyData[];
}

export interface CountryConfiguration {
	name: string;
	code: string;
	color: string;
}

export interface Configuration {
	countries: CountryConfiguration[];
	startDate: string;
	framesPerDay: number;
}
