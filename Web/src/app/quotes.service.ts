import { Injectable } from '@angular/core';
import { DataServiceService } from './data-service.service';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {


  quotes = [
    "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful. — Albert Schweitzer",
    "The only limit to our realization of tomorrow is our doubts of today. — Franklin D. Roosevelt",
    "Believe you can, and you're halfway there. — Theodore Roosevelt",
    "Your life is your story. Write well. Edit often.",
    "Difficulties in life are intended to make us better, not bitter.",
    "Every day is a chance to begin again. Don't focus on the failures of yesterday, start today with positive thoughts and expectations.",
    "Dream big, work hard, stay focused, and surround yourself with good people.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
    "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
    "It does not matter how slowly you go as long as you do not stop. — Confucius",
    "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
    "Start where you are. Use what you have. Do what you can. — Arthur Ashe",
    "Keep your face always toward the sunshine—and shadows will fall behind you. — Walt Whitman",
    "You are never too old to set another goal or to dream a new dream. — C.S. Lewis",
    "Hardships often prepare ordinary people for an extraordinary destiny. — C.S. Lewis",
    "Don't be pushed by your problems. Be led by your dreams. — Ralph Waldo Emerson",
    "The best way to predict the future is to create it. — Peter Drucker",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us. — Ralph Waldo Emerson",
    "If opportunity doesn't knock, build a door. — Milton Berle",
    "Success usually comes to those who are too busy to be looking for it. — Henry David Thoreau",
    "The only way to do great work is to love what you do. — Steve Jobs",
    "The harder the conflict, the greater the triumph. — George Washington",
    "Don't count the days, make the days count. — Muhammad Ali",
    "I am not a product of my circumstances. I am a product of my decisions. — Stephen Covey",
    "Your time is limited, so don't waste it living someone else's life. — Steve Jobs",
    "I have learned over the years that when one's mind is made up, this diminishes fear. — Rosa Parks",
    "Happiness is not something ready made. It comes from your own actions. — Dalai Lama",
    "Act as if what you do makes a difference. It does. — William James",
    "Success is how high you bounce when you hit bottom. — George S. Patton",
    "Don't limit your challenges. Challenge your limits.",
    "I can't change the direction of the wind, but I can adjust my sails to always reach my destination. — Jimmy Dean",
    "You are braver than you believe, stronger than you seem, and smarter than you think. — A.A. Milne",
    "Failure is the opportunity to begin again more intelligently. — Henry Ford",
    "We may encounter many defeats, but we must not be defeated. — Maya Angelou",
    "Perseverance is not a long race; it is many short races one after the other. — Walter Elliot",
    "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
    "Don't wait. The time will never be just right. — Napoleon Hill",
    "You only live once, but if you do it right, once is enough. — Mae West",
    "It always seems impossible until it's done. — Nelson Mandela",
    "The only place where success comes before work is in the dictionary. — Vidal Sassoon",
    "Challenges are what make life interesting and overcoming them is what makes life meaningful. — Joshua J. Marine",
    "The best way out is always through. — Robert Frost",
    "If you want to achieve greatness, stop asking for permission. — Anonymous",
    "Keep going. Everything you need will come to you at the perfect time.",
    "To succeed in life, you need two things: ignorance and confidence. — Mark Twain",
    "Don't be afraid to give up the good to go for the great. — John D. Rockefeller",
    "A journey of a thousand miles begins with a single step. — Lao Tzu",
    "Success is walking from failure to failure with no loss of enthusiasm. — Winston Churchill",
    "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. — Christian D. Larson",
    "Your present circumstances don't determine where you can go; they merely determine where you start. — Nido Qubein",
    "The only person you are destined to become is the person you decide to be. — Ralph Waldo Emerson",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "You have power over your mind—not outside events. Realize this, and you will find strength. — Marcus Aurelius",
    "Every champion was once a contender who refused to give up. — Rocky Balboa",
    "Believe in the magic of beginnings.",
    "It's not whether you get knocked down, it's whether you get up. — Vince Lombardi",
    "Failure will never overtake me if my determination to succeed is strong enough. — Og Mandino",
    "Aim for the moon. If you miss, you may hit a star. — W. Clement Stone",
    "The best revenge is massive success. — Frank Sinatra",
    "Great things never come from comfort zones.",
    "Don't stop when you're tired. Stop when you're done.",
    "I find that the harder I work, the more luck I seem to have. — Thomas Jefferson",
    "The best preparation for tomorrow is doing your best today. — H. Jackson Brown, Jr.",
    "Do something today that your future self will thank you for.",
    "Success is not in what you have, but who you are. — Bo Bennett",
    "A winner is a dreamer who never gives up. — Nelson Mandela",
    "Don't be afraid to start over. It's a chance to build something better this time.",
    "You don't need to see the whole staircase, just take the first step. — Martin Luther King Jr.",
    "Believe in yourself and all that you are. — Christian D. Larson",
    "Great things are done by a series of small things brought together. — Vincent Van Gogh",
    "If you fell down yesterday, stand up today. — H.G. Wells",
    "You miss 100% of the shots you don't take. — Wayne Gretzky",
    "If you want something you've never had, you must be willing to do something you've never done. — Thomas Jefferson",
    "Don't quit. Suffer now and live the rest of your life as a champion. — Muhammad Ali",
    "Nothing will work unless you do. — Maya Angelou",
    "The secret to getting ahead is getting started. — Mark Twain",
    "It is never too late to be what you might have been. — George Eliot",
    "If you're going through hell, keep going. — Winston Churchill",
    "Turn your wounds into wisdom. — Oprah Winfrey",
    "Small steps in the right direction can turn out to be the biggest step of your life.",
    "Your limitation—it's only your imagination.",
    "There is only one way to avoid criticism: do nothing, say nothing, and be nothing. — Aristotle",
    "Don't let yesterday take up too much of today. — Will Rogers",
    "You are confined only by the walls you build yourself.",
    "You don't always get what you wish for; you get what you work for.",
    "The difference between ordinary and extraordinary is that little extra. — Jimmy Johnson",
    "Start each day with a positive thought and a grateful heart. — Roy T. Bennett",
    "Success is not how high you have climbed, but how you make a positive difference to the world. — Roy T. Bennett",
    "Success doesn't just find you. You have to go out and get it.",
    "The only way to achieve the impossible is to believe it is possible. — Charles Kingsleigh",
    "Keep your eyes on the stars, and your feet on the ground. — Theodore Roosevelt",
    "Push yourself, because no one else is going to do it for you.",
    "Success is not the absence of failure; it's the persistence through failure. — Aisha Tyler",
    "Set your goals high, and don't stop until you get there. — Bo Jackson",
    "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",
    "You are stronger than you think.",
    "Go the extra mile. It's never crowded.",
    "Success is getting what you want, happiness is wanting what you get. — W.P. Kinsella",
    "Your biggest competition is yourself.",
    "Don't count the days. Make the days count. — Muhammad Ali",
    "Sometimes later becomes never. Do it now."
  ];

  constructor(private data: DataServiceService) { }

  GetQuote() {
    //one quote per day, need to use the date as a seed 
    const unixTimeMS = Date.now();
    const seed = this.data.RoundUpToNearestMultiple(unixTimeMS, 84600*1000);

    const index = seed % 100;
    return this.quotes[index];
  }
}
