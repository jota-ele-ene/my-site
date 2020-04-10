document.write('<script type="text/javascript" src="js/temporary.js" ></script>');

var appTitle = new Vue({
  el: ".title",
  data: {
    greeting: "Hello World!"
  }
});


var BgComponent = Vue.extend({ 
  template: '#background-image',
  data: function () {
    return { 
      active:false,
      showCredits: false,
      imageShowed: true,
      scaling:false,
      canToggle:true,
      imageDescription: '',
      imageAltDescription: '',
      imageUserName: '',
      imageFullName: '',
      imageUrl: '',
      imageSrc: '',
      imageSize: '',
      imageUnsplash: '',
      imageLocation: '',
      imageStatus: '',
      error: '', 
    }
  },
  methods: {
    toggle() { 
      if (this.canToggle) {
        this.active = !this.active;  
        if (!this.active) this.loadImage();
      }
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
      var app_id = 'FcB-Vxj7c1UWtfsK7U1rKQvl9UFtkRgBbJxfA0ND4T0'
      //var url = 'https://api.unsplash.com/photos/random?client_id=' + app_id;    
      var url = getRandomImageDataURL();    
      fetch(url+`&content_filter=high&orientation=`+this.getOrientation())
        .then((res) => res.json())
        .then((res) => {
          vm.imageStatus = "dataLoaded";
          vm.imageDescription = res.description;
          vm.imageAltDescription = res.alt_description;
          vm.imageUserName = "https://unsplash.com/@"+res.user.username;
          vm.imageFullName = res.user.name;
          vm.imageUrl = res.urls.regular;
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



// For circular navigation: https://tympanus.net/Tutorials/CircularNavigation/index.html
//                          https://codepen.io/CreativePunch/pen/lAHiu/
//                          https://codepen.io/seyedi/pen/YXEqwB
//                          https://codepen.io/mahmoud-nb/pen/pbNBYP/
//
