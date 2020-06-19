//BackgroundCheck.init({
//  targets: '.ca-icon,.title'
//});


const profile = Vue.component('profile', {
 props: ['profile'],
 template: `<a :href="profile.link"><span class="ca-icon" v-html="profile.icon" :class="profile.class"></span></a>` 
 });

var appTitle = new Vue({
  el: ".title-div",
  data: {
    greeting: "Hello World!",
    showMenu: true,
    links1: [
     {id: 1, active: true, link: "https://twitter.com/jota_ele_ene", icon: "<i class='fab fa-twitter'></i>", class: ""},
     {id: 2, active: true, link: "https://www.linkedin.com/in/jotaeleene/", icon: "<i class='fab fa-linkedin'></i>", class: ""},
     {id: 3, active: true, link: "https://medium.com/@jota_ele_ene", icon: "<i class='fab fa-medium'></i>", class: ""},
     {id: 4, active: true, link: "https://refind.com/jota_ele_ene", icon: "<img src='/images/Refind.png' style='width: 25px;margin-top: 5px;'>", class: "refind"}
    ],
    links2: [
     {id: 1, active: true, link: "https://empresas.blogthinkbig.com/author/jose-luis-nunez-diaz/", icon: "T", class: "think-big"},
     {id: 2, active: true, link: "https://github.com/jota-ele-ene/", icon: "<i class='fab fa-github'></i>", class: ""},
     {id: 3, active: true, link: "https://codepen.io/jota_ele_ene", icon: "<i class='fab fa-codepen'></i>", class: ""},
    ]
  }
});



var BgComponent = Vue.extend({ 
template: `
  <div  class="container">  
    
    <transition name="fade" v-on:after-enter="imageLoadedAndShowed">  
      <div v-if="active" @mouseover="disallowToggle" @transitionend="allowToggle"
           :style="{ backgroundImage: 'url(' + imageSrc + ')' }" 
     :class="{image_showed: imageShowed, image: true}">  
      </div> 
    </transition>

  <a style="top: 0; right: 0; position: fixed; height: 50px; width: 50px;" 
     :href="imageSrc" @click="download_request" rel="nofollow" download>
  </a>

  <div v-if="active" id="credits-box"> 
    <div :class="{out : noFaInfo}">
    <i  @mouseover="showCredits = !showCredits" class="fas fa-info-circle"></i>
    </div>  
    <transition name="slide-fade1" v-on:enter="noFaInfo=true" v-on:after-leave="noFaInfo=false"> 
      <div v-if="showCredits" class="credits">
        <div class="font-credits">
            <span @click="showCredits = !showCredits">Photo credits: {{imageLocation}} by <a :href="imageUserName" target="_blank"> {{imageFullName}}</a> via <a :href="imageUnsplash" target="_blank" >Unsplash</a></span>
          <!--<a :href="imageSrc" @click="download_request" rel="nofollow" download><i class="fas fa-arrow-alt-circle-down"></i></a></div>-->
      </div>
    </transition>

  </div>

</container>
`,
  data: function () {
    return { 
      active:false,
      showCredits: false,
      noFaInfo: false,
      imageShowed: true,
      scaling:false,
      canToggle:true,
      imageDescription: '',
      imageAltDescription: '',
      imageUserName: '',
      imageFullName: '',
      imageUrl: '',
      imageSrc: '',
      imageDownload: '',
      imageSize: '',
      imageUnsplash: '',
      imageLocation: '',
      imageStatus: '',
      error: '', 
    }
  },
  methods: {
    toggle() { 
	//console.log("entering toggle - refer: "+this.$attrs['refer']+"; active: "+this.active+"; canToggle: "+this.canToggle);
      if (this.canToggle) {
        this.active = !this.active;  
        if (!this.active) this.loadImage();
      }
	//console.log("exiting toggle - refer: "+this.$attrs['refer']+"; active: "+this.active+"; canToggle: "+this.canToggle);
    },
    allowToggle() {
     if (this.scaling) {
       this.scaling = false;
       this.canToggle = true;
       hub.$emit('toggleallowed');
     }
    },
    disallowToggle() {
     if (!this.scaling) {
        this.canToggle = false;
        this.scaling = true;
        hub.$emit('togglenotallowed');
     }
    }, 
    imageLoadedAndShowed() {
      this.imageShowed = true;
    },
    loadImage() {
      var vm = this;
      var app_id = ''
      var url = 'https://tiny.cc/x4i1mz';    
      //var url = getRandomImageDataURL();
      //fetch(url)
      fetch(url+this.getOrientation())
        .then((res) => res.json())
        .then((res) => {
          vm.imageStatus = "dataLoaded";
          vm.imageDescription = res.description;
          vm.imageAltDescription = res.alt_description;
          vm.imageUserName = "https://unsplash.com/@"+res.user.username;
          vm.imageFullName = res.user.name;
          vm.imageUrl = res.urls.regular;
          vm.imageDownload = res.links.download_location;
          vm.imageSize = res.width + "x" + res.height;
          vm.imageUnsplash = res.links.html;
          vm.imageLocation = res.location.name;
          fetch(vm.imageUrl)
          .then(res => res.blob()) // Gets the response and returns it as a blob
          .then(blob => {
            let objectURL = URL.createObjectURL(blob);
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = evt => {
              let img = new Image();
              img.onload = () => {
                this.imageSize = img.width + "x" + img.height;
                this.imageSrc = evt.target.result;
              }
              img.src = evt.target.result;
              this.imageStatus = "loaded";
              this.imageShowed = false;
		console.log("emiting imageLoaded: "+this.$attrs['refer']);
              hub.$emit('imageLoaded', this.$attrs['refer']);
            }
            reader.onerror = evt => {
              console.error(evt);
            }
        });      
            
        })
        .catch(function (error) {
          console.log("dataLoadingError:"+error);
          vm.imageStatus = 'dataLoadingError'; 
          vm.error = error; 
        });
    },
    download_request() {
	fetch("proxyimg.html?url="+encodeURI(this.imageDownload)).catch(function (error) {
          console.log("download_request(): error:"+error);
        });;          
    },
    getOrientation() {
    	if( document.documentElement.clientWidth > document.documentElement.clientHeight  ) {
            return "landscape";
        }
        else {
            return "portrait";
        }
    }
  },
  mounted: function () {
    this.loadImage();
  },
	created: function() {
		hub.$on('toggleallowed', this.allowToggle);
		hub.$on('togglenotallowed', this.disallowToggle);
	}
})

var hub = new Vue();


var bgApp = new Vue({
  el: '.bg', 
  components: {
  'background-image': BgComponent
  },
  data: {
    timeout: false,
    canToggle: true,
    imageLoaded:false
  },
  methods: {
    toggle: function (){
     	  this.$children[0].toggle();   
     	  this.$children[1].toggle();  
    }, 
    loadFirstImage: function (refer) {
	    //console.log("loadFirstImage: "+refer);
      if (refer = "first")
        this.$children[0].toggle();  
      else
        this.$children[1].toggle();   
    },
    loop: function () {
      var that = this;
      this.timeout = setTimeout(function () {
        that.toggle();
        that.loop();
      }, 10000);
    }
  },
  mounted() {
    this.loop();
  },
	created: function() {
		hub.$once('imageLoaded', this.loadFirstImage);
	}
}) 


