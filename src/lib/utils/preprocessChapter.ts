/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* 


 <p  data-comment-chapter-id=12312 >fsadf</p>



*/

// traverse once to get all existing id
// generate random id for comment
//import { COMMENT_IDENTIFIER } from '../data/constants';

const regex = new RegExp(
	'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
	'i'
);

function makeid(): string {
	//	return Cypto.randomUUID();
	const id = globalThis.crypto.randomUUID();
	return id;
}
let COMMENT_IDENTIFIER = 'data-chapter-comment-id';
function traverse(
	tree: Element,
	visited: Set<string | null>,
	ids: string[] = []
) {
	//console.log('traverse', tree);
	const children = Array.from(tree.children);

	if (
		/* tree.nodeType == 1 &&  */ tree.localName === 'p' ||
		tree.tagName === 'p'
	) {
		// it is an element node
		const cid = tree.getAttribute(COMMENT_IDENTIFIER);

		if (!cid || cid.length !== 36 || !regex.test(cid)) {
			// does not exists
			// a new element
			if (cid) debugger;
			let guid = makeid();

			while (visited.has(guid)) guid = makeid(); // make sure not duplicate id, 0.0000001 chance will happen :)
			ids.push(guid);
			tree.setAttribute(COMMENT_IDENTIFIER, guid);
		}
	} else {
		tree.removeAttribute(COMMENT_IDENTIFIER);
	}

	for (const child of children) {
		traverse(child, visited, ids);
	}
}
//import { Document, Window } from 'happy-dom';

// add comment id to every element
export async function preprocessChapter(html: string, ids: string[] = []) {
	if (typeof window === 'undefined')
		throw 'missing window object cant preprocess chapters';
	const IsomorphicDocument = document;
	/* 	typeof document == 'undefined'
			? new (await import('jsdom')).JSDOM().window.document
			: document; */

	const doc = IsomorphicDocument.createElement('div');
	doc.innerHTML = html;
	//console.log('before precessing', doc);

	// get all existing ids
	const els = doc.querySelectorAll('p[' + COMMENT_IDENTIFIER + ']');

	const visited = new Set<string | null>();

	for (const e of Array.from(els)) {
		visited.add(e.getAttribute(COMMENT_IDENTIFIER));
	}

	traverse(doc, visited, ids);
	// add comment id to every tag
	const str = doc.innerHTML;
	// browser Sanitize(doc);
	//console.log('preprocessed', doc);
	return str;
}
export class ChapterElementHandler {
	element(element: Element) {
		// An incoming element, such as `div`
		console.log(`Incoming element: ${element.tagName}`);
		if (element.tagName == 'p') {
			traverse(element, new Set(), []);
		}
	}

	comments(comment) {
		// An incoming comment
	}

	text(text) {
		// An incoming piece of text
	}
}
export async function cfChapter() {
	return new Promise(() =>
		new HTMLRewriter()
			.on('p', new ChapterElementHandler())
			.transform(new Response(query.content))
	);
}
const test = `
<div id="Outer">

<div class="banner" style="min-height:90px"><div id="div-gpt-ad-1456148316198-0">
<script type="text/javascript">googletag.cmd.push(function() { google tag.display("div-gpt-ad-1456148316198-0"); });</script>
</div></div>

<div id="Inner">

<div id="Languages"><a href="http://hy.lipsum.com/">Հայերեն</a> <a href="http://sq.lipsum.com/">Shqip</a> <span class="ltr" dir="ltr"><a href="http://ar.lipsum.com/">‫العربية</a></span> <a href="http://bg.lipsum.com/">Български</a> <a href="http://ca.lipsum.com/">Català</a> <a href="http://cn.lipsum.com/">中文简体</a> <a href="http://hr.lipsum.com/">Hrvatski</a> <a href="http://cs.lipsum.com/">Česky</a> <a href="http://da.lipsum.com/">Dansk</a> <a href="http://nl.lipsum.com/">Nederlands</a> <a class="zz" href="http://www.lipsum.com/">English</a> <a href="http://et.lipsum.com/">Eesti</a> <a href="http://ph.lipsum.com/">Filipino</a> <a href="http://fi.lipsum.com/">Suomi</a> <a href="http://fr.lipsum.com/">Français</a> <a href="http://ka.lipsum.com/">ქართული</a> <a href="http://de.lipsum.com/">Deutsch</a> <a href="http://el.lipsum.com/">Ελληνικά</a> <span class="ltr" dir="ltr"><a href="http://he.lipsum.com/">‫עברית</a></span> <a href="http://hi.lipsum.com/">हिन्दी</a> <a href="http://hu.lipsum.com/">Magyar</a> <a href="http://id.lipsum.com/">Indonesia</a> <a href="http://it.lipsum.com/">Italiano</a> <a href="http://lv.lipsum.com/">Latviski</a> <a href="http://lt.lipsum.com/">Lietuviškai</a> <a href="http://mk.lipsum.com/">македонски</a> <a href="http://ms.lipsum.com/">Melayu</a> <a href="http://no.lipsum.com/">Norsk</a> <a href="http://pl.lipsum.com/">Polski</a> <a href="http://pt.lipsum.com/">Português</a> <a href="http://ro.lipsum.com/">Româna</a> <a href="http://ru.lipsum.com/">Pyccкий</a> <a href="http://sr.lipsum.com/">Српски</a> <a href="http://sk.lipsum.com/">Slovenčina</a> <a href="http://sl.lipsum.com/">Slovenščina</a> <a href="http://es.lipsum.com/">Español</a> <a href="http://sv.lipsum.com/">Svenska</a> <a href="http://th.lipsum.com/">ไทย</a> <a href="http://tr.lipsum.com/">Türkçe</a> <a href="http://uk.lipsum.com/">Українська</a> <a href="http://vi.lipsum.com/">Tiếng Việt</a> </div>

<h1>Lorem Ipsum</h1>
<h4>"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."</h4>
<h5>"There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain..."</h5>


<hr>

<div id="Content">
<div id="bannerL"><div id="div-gpt-ad-1474537762122-2">
<script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1474537762122-2"); });</script>
</div></div>
<div id="bannerR"><div id="div-gpt-ad-1474537762122-3">
<script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1474537762122-3"); });</script>
</div></div>
<div id="Panes"><div>
<h2>What is Lorem Ipsum?</h2>
<p><strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
</div><div>
<h2>Why do we use it?</h2>
<p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
</div><br><div>
<h2>Where does it come from?</h2>
<p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p><p>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>
</div><div>
<h2>Where can I get some?</h2>
<p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.</p>
<form method="post" action="/feed/html"><table style="width:100%"><tbody><tr><td rowspan="2"><input type="text" name="amount" value="5" size="3" id="amount"></td><td rowspan="2"><table style="text-align:left"><tbody><tr><td style="width:20px"><input type="radio" name="what" value="paras" id="paras" checked="checked"></td><td><label for="paras">paragraphs</label></td></tr><tr><td style="width:20px"><input type="radio" name="what" value="words" id="words"></td><td><label for="words">words</label></td></tr><tr><td style="width:20px"><input type="radio" name="what" value="bytes" id="bytes"></td><td><label for="bytes">bytes</label></td></tr><tr><td style="width:20px"><input type="radio" name="what" value="lists" id="lists"></td><td><label for="lists">lists</label></td></tr></tbody></table></td><td style="width:20px"><input type="checkbox" name="start" id="start" value="yes" checked="checked"></td><td style="text-align:left"><label for="start">Start with 'Lorem<br>ipsum dolor sit amet...'</label></td></tr><tr><td></td><td style="text-align:left"><input type="submit" name="generate" id="generate" value="Generate Lorem Ipsum"></td></tr></tbody></table></form></div><br></div>
<hr><div class="boxed"><strong>Translations:</strong> Can you help translate this site into a foreign language ? Please email us with details if you can help.</div>

<hr><div class="boxed">There is a set of mock banners available <a href="/banners" class="lnk">here</a> in three colours and in a range of standard banner sizes:<br><a href="/banners"><img src="/images/banners/black_234x60.gif" width="234" height="60" alt="Banners"></a><a href="/banners"><img src="/images/banners/grey_234x60.gif" width="234" height="60" alt="Banners"></a><a href="/banners"><img src="/images/banners/white_234x60.gif" width="234" height="60" alt="Banners"></a></div>

<hr><div class="boxed"><strong>Donate:</strong> If you use this site regularly and would like to help keep the site on the Internet, please consider donating a small sum to help pay for the hosting and bandwidth bill. There is no minimum donation, any sum is appreciated - click <a target="_blank" href="/donate" class="lnk">here</a> to donate using PayPal. Thank you for your support.</div>
<div class="boxed"><strong>Donate Bitcoin:</strong> 16UQLq1HZ3CNwhvgrarV6pMoA2CDjb4tyF</div>

<hr><div class="boxed" id="Packages">
<a target="_blank" rel="noopener" href="https://github.com/traviskaufman/node-lipsum">NodeJS</a>
<a target="_blank" rel="noopener" href="http://code.google.com/p/pypsum/">Python Interface</a>
<a target="_blank" rel="noopener" href="http://gtklipsum.sourceforge.net/">GTK Lipsum</a>
<a target="_blank" rel="noopener" href="http://github.com/gsavage/lorem_ipsum/tree/master">Rails</a>
<a target="_blank" rel="noopener" href="https://github.com/cerkit/LoremIpsum/">.NET</a>
<a target="_blank" rel="noopener" href="http://groovyconsole.appspot.com/script/64002">Groovy</a>
</div>

<hr><div id="Lipsum-Unit5" style="margin:10px 0">
<script type="text/javascript">googletag.cmd.push(function() { googletag.display("Lipsum-Unit5"); });</script>
</div>
<hr><div id="Translation">

<h3>The standard Lorem Ipsum passage, used since the 1500s</h3><p>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</p><h3>Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC</h3><p>"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"</p>
<h3>1914 translation by H. Rackham</h3>
<p>"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"</p>
<h3>Section 1.10.33 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC</h3>
<p>"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."</p>
<h3>1914 translation by H. Rackham</h3>
<p>"On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains."</p>
</div>

</div>

<hr>

<div class="boxed"><a style="text-decoration:none" href="mailto:help@lipsum.com">help@lipsum.com</a><br><a style="text-decoration:none" target="_blank" href="/privacy.pdf">Privacy Policy</a></div>



</div>

<div class="banner" style="min-height:90px"><div id="div-gpt-ad-1456148316198-1">
<script type="text/javascript">googletag.cmd.push(function() { googletag.display("div-gpt-ad-1456148316198-1"); });</script>
</div></div>

</div>
`;
function broswerSanitize(doc: HTMLDivElement) {
	const s = new XMLSerializer();
	const str = s.serializeToString(doc);
	return str;
}
