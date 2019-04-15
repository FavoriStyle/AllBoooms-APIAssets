import CommentsWidget from './components/widget.js'
import { Cookies } from './internal/_system.js'

//Cookies.set('allbooms_token', 'my_test_token');

console.log({Cookies});

document.body.appendChild(new CommentsWidget('lSgmGGAVrVta3X9xeO3D', '1'))
