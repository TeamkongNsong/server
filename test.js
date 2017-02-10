const Hangul = require('hangul-js');
//
// var input = '아버지가 방에 들어가신다'
//
// function stronger(x){
//   if(x == 'ㄱ' || x == 'ㅋ') return 'ㄲ';
//   if(x == 'ㄷ' || x == 'ㅌ') return 'ㄸ';
//   if(x == 'ㅂ' || x == 'ㅍ') return 'ㅃ';
//   if(x == 'ㅅ') return 'ㅆ';
//   if(x == 'ㅈ' || x == 'ㅊ') return 'ㅉ';
//   return x;
// }
//
// console.log(Hangul.a(Hangul.d(input).map(stronger)));
// // 아뻐찌까 빵에 뜰어까씬따
//
//
// var atest = Hangul.disassemble('ㄱ'); // ['ㄱ','ㅏ','ㄴ','ㅏ','ㄷ','ㅏ']
//
// var atest2 = Hangul.disassemble('ab가c'); // ['a','b','ㄱ','ㅏ','c']
//
// var atest3 = Hangul.disassemble('ab@!23X.'); // ['a','b','@','!','2','3','X','.']
//
// console.log(atest, atest2, atest3);
//
//
//
// var test = Hangul.assemble(atest); // '가나다'
//
// var test2 = Hangul.assemble(atest2); // 'ab가c'
//
// var test3 = Hangul.assemble(atest3); // 'ab@123X.'
//
// console.log(test, test2, test3);

// const arr = req.params.word
//
// arr.push(word)
//
// if (arr === )


//
// const a = 'myname'; // 0
// const b = 'klkasdlfkemy'; // 0
// const c = 'alkwejflkjweaasdf'; // -1
//
// const arr = [a, b, c];
// console.log(arr);




const aArr = [];
for (let i = 0; i < 10000; i++) {
  aArr.push('myname');
}

const searcher = new Hangul.Searcher('my');

const result = [];
aArr.forEach((word) => {
  if (searcher.search(word) !== -1) {
    result.push(word);
  }
});
console.log(result);
