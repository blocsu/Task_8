export default (express, bodyParser, createReadStream, crypto, http, CORS, writeFileSync, User, m, puppeteer) => {
  const appSrc = express();  

  appSrc  
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .get('/login/', (req, res) => {
    res
    .set({'Content-Type': 'text/plain; charset=utf-8', ...CORS})
    .send('dotsenkosar')
  })
  .get('/code/', (req, res) => {
    res
    .set({'Content-Type': 'text/plain; charset=utf-8', ...CORS})
    createReadStream(import.meta.url.substring(7)).pipe(res)
  })
  .get('/sha1/:input/', (req, res) => {
    res  
    .set({'Content-Type': 'text/plain; charset=utf-8', ...CORS})
    .send(crypto.createHash('sha1').update(req.params.input).digest('hex'))
  })    
  .all('/req/', async (req, res) => {          
      const addr = req.method == 'POST'? req.body.addr : req.query.addr; 
      console.log(addr);     
      await http.get(addr || 'http://bloc.su', (r, b = '') => {        
        r
        .on('data', (c) => { b += c; })
        .on( 'end', () => res.set({'Content-Type': 'text/plain; charset=utf-8', ...CORS}).send(b));
      });            
  })
  .get('/insert/', async r => {
    const URL = 'mongodb://writer:writer@localhost/users';
    try {
      await m.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true});
      
  } catch(e) {
      console.log(e.codeName);
  }
    r.res.json(await User.find())
  })
  .post('/insert/', async r => {
        const { login, password, URL } = r.body;
        const newUser = new User({ login, password });       
        try {
          await m.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true});
          
      } catch(e) {
          console.log(e.codeName);
      }
        try {
            await newUser.save();
            r.res.status(201).json({'Добавлено: ': login})
        } catch (e) {
            r.res.status(400).json({'Ошибка: ': 'Нет пароля!'});
        }        
  })
  .get('/wordpress/', async (req, res) => {
    const src = await fetch('http://localhost/wordpress/wp-json/wp/v2/posts/1').then(x => x.text());
    const resp = {
      title: {
        rendered: 'dotsenkosar'
      }
    }
    res
    .set({'Content-Type': 'application/json; charset=utf-8', ...CORS})
    .send(src)    
  })
  .all('/render/', async r => {
    const addr =  r.query.addr;
    const src = await fetch(addr).then(x => x.text());
    const {random2, random3} = JSON.parse(JSON.stringify(r.body));//{"random2":"0.4433","random3":"0.1199"};
    writeFileSync('./views/template.pug', src);
    console.log({random2, random3});
    r.res
    .set({'Content-Type': 'text/plain; charset=utf-8', ...CORS})
    .render('openedu', {random2, random3})    
  })
  .get('/user/', async r => {
    const {users} = {users: [{"_id":"65e2203a44edc2ae34f302df","login":"elias@goss","password":"123"},{"_id":"65e33c91f046c00f9397dde2","login":"reader","password":"reader"},{"_id":"65e345d3644ee31478c1ca50","login":"magic","password":"understund"},{"_id":"65e480c809c099028d125c13","__v":0},{"_id":"65e4811c09c099028d125c15","login":"gendolf","__v":0},{"_id":"65e48b70d1fa9fe373abf95d","login":"Wizard","password":"4321","__v":0},{"_id":"65e49630179c7aa4c8e0b994","login":"Gimly","password":"ylmig","__v":0},{"_id":"65e4c1d9d6817edb10a93be5","login":"Gimly","password":"ylmig","__v":0},{"_id":"65e5e3611f0216bdfe6262bd","login":"Gimly","password":"ylmig","__v":0},{"_id":"65e74ecc9f7afb96911209a2","login":"bilbo","password":"oblib","__v":0},{"_id":"65e76313285ea0e61a756502","login":"test","password":"tset","__v":0},{"_id":"65e763c2a78b51e8a0225610","login":"music","password":"cisum","__v":0}]};
    r.res.locals.usersTitle = 'Список пользователей';
    r.res.format({
        'application/json': () => r.res.json(users), 
        'text/html': () => r.res.render('users', { users })  
    });    
  })
  .get('/test/', async (r, res) => {
    const URL = r.query.URL || 'https://kodaktor.ru/g/80b5cdf';    
    res.set({'Content-Type': 'text/plain; charset=utf-8', ...CORS})    
    const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser', headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage();
    await page.goto(URL);        
    await page.waitForSelector('#bt');
    await page.click('#bt');
    await page.waitForSelector('#inp');
    const got = await page.$eval('#inp', el => el.value);
    browser.close();
    r.res.send(got);
})
  .all('*', r => r.res.set({'Content-Type': 'text/plain; charset=utf-8', ...CORS}).send('dotsenkosar'))
  .set('view engine', 'pug');
  
  return appSrc;
} 