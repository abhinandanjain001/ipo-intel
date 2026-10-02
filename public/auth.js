import {firebaseConfig} from './firebase-config.js';
const $=id=>document.getElementById(id);
let auth,sdk,mode='signin',busy=false;
const messages={
 'auth/invalid-credential':'The email or password is incorrect.',
 'auth/invalid-email':'Enter a valid email address.',
 'auth/email-already-in-use':'Unable to create this account. Try signing in or resetting your password.',
 'auth/weak-password':'Choose a stronger password with at least 8 characters.',
 'auth/password-does-not-meet-requirements':'This password does not meet the account security requirements.',
 'auth/too-many-requests':'Too many attempts. Please wait and try again.',
 'auth/network-request-failed':'Connection failed. Check your internet connection and retry.',
 'auth/operation-not-allowed':'This sign-in method is temporarily unavailable.',
 'auth/user-disabled':'This account is disabled. Contact the site owner.',
 'auth/invalid-api-key':'Sign-in is temporarily unavailable. Please try again later.'
};
function feedback(message,error=false){$('auth-feedback').textContent=message;$('auth-feedback').classList.toggle('auth-error',error);}
function setBusy(value){busy=value;for(const el of $('auth-form').elements)el.disabled=value;$('auth-switch').disabled=value;$('auth-reset').disabled=value;$('auth-submit').textContent=value?'Please wait…':mode==='signup'?'Create account':mode==='reset'?'Send reset link':'Sign in';}
function setMode(value){mode=value;feedback('');const signup=value==='signup',reset=value==='reset';$('auth-title').textContent=signup?'Create your account':reset?'Reset your password':'Welcome to IPO Intel';$('auth-description').textContent=reset?'Enter your email to request a password reset link.':'Sign in securely to your IPO Intel account.';$('auth-password-label').hidden=reset;$('auth-confirm-label').hidden=!signup;$('auth-password').required=!reset;$('auth-confirm').required=signup;$('auth-password').minLength=signup?8:1;$('auth-password').autocomplete=signup?'new-password':'current-password';$('auth-password').value='';$('auth-confirm').value='';$('auth-switch').textContent=signup?'Already have an account? Sign in':reset?'Back to sign in':'New to IPO Intel? Create an account';$('auth-reset').hidden=value!=='signin';setBusy(false);}
$('auth-open').addEventListener('click',()=>{setMode('signin');$('auth-dialog').showModal();$('auth-email').focus();});
$('auth-close').addEventListener('click',()=>{if(!busy)$('auth-dialog').close();});
$('auth-dialog').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
$('auth-dialog').addEventListener('close',()=>{$('auth-password').value='';$('auth-confirm').value='';});
$('auth-switch').addEventListener('click',()=>setMode(mode==='signin'?'signup':'signin'));
$('auth-reset').addEventListener('click',()=>setMode('reset'));
$('auth-form').addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;if(!auth){feedback('Sign-in is temporarily unavailable. Please reload and try again.',true);return;}if(!$('auth-form').reportValidity())return;
 const email=$('auth-email').value.trim(),password=$('auth-password').value;
 if(mode==='signup'&&password!==$('auth-confirm').value){feedback('The passwords do not match.',true);$('auth-confirm').focus();return;}
 setBusy(true);feedback('');
 try{
  if(mode==='reset'){await sdk.sendPasswordResetEmail(auth,email);feedback('If an account exists for this email, a reset link will be sent. Check your inbox.');}
  else{if(mode==='signup')await sdk.createUserWithEmailAndPassword(auth,email,password);else await sdk.signInWithEmailAndPassword(auth,email,password);$('auth-dialog').close();}
 }catch(error){if(mode==='reset'&&error.code==='auth/user-not-found')feedback('If an account exists for this email, a reset link will be sent. Check your inbox.');else feedback(messages[error.code]||'We could not complete this request. Please try again.',true);}
 finally{setBusy(false);}
});
$('auth-signout').addEventListener('click',async()=>{if(!auth)return;$('auth-signout').disabled=true;try{await sdk.signOut(auth);$('account-feedback').textContent='You have signed out.';}catch{$('account-feedback').textContent='Sign-out failed. Please retry.';}finally{$('auth-signout').disabled=false;}});
async function initialize(){
 try{const [app,authSdk]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js')]);sdk=authSdk;auth=sdk.getAuth(app.initializeApp(firebaseConfig));
  await sdk.setPersistence(auth,sdk.browserLocalPersistence);
  sdk.onAuthStateChanged(auth,user=>{$('auth-open').hidden=!!user;$('account-user').hidden=!user;$('auth-signout').hidden=!user;$('account-user').textContent=user?.email||'Your account';$('auth-open').disabled=false;$('auth-open').textContent='Sign in';},()=>{$('account-feedback').textContent='Unable to restore your session. Please reload.';});
 }catch{$('auth-open').disabled=false;$('auth-open').textContent='Sign in';$('auth-submit').disabled=true;$('auth-open').addEventListener('click',()=>feedback('Sign-in is temporarily unavailable. Please reload and try again.',true));}
}
initialize();
