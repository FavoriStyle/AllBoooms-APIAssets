export default(e,t)=>{if(!document.head.querySelector(`style[data-font="${e}"]`)){const d=document.createElement("style");d.innerHTML=`@import url('${t}');`,d.setAttribute("data-font",e),document.head.appendChild(d)}};