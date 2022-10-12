window.addEventListener('touchmove', () => {});

class FBSortableMBVL {
  constructor(list, options) {
    this.list = typeof list === 'string' ?
    document.querySelector(list) :
    list;
    this.dynamicYRange = [];
    this.items = Array.from(this.list.children);
    this.animation = false;
    this.shadow = null;
    this.options = Object.assign({
      animationSpeed: 200,
      animationEasing: 'ease-out',
      useShadow: false
    },
    options || {});

    this.dragStart = this.dragStart.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);

    this.list.addEventListener('touchstart', this.dragStart, false);
    this.list.addEventListener('mousedown', this.dragStart, false);
  }

  preNew(){
    setTimeout(_=>{
      this.items = Array.from(this.list.children);
    },1000)
  }

  dragStart(e) {
    if (this.animation) return;
    if (e.type === 'mousedown' && e.which !== 1) return;
    if (e.type === 'touchstart' && e.touches.length > 1) return;

    this.handle = null;

    let el = e.target;
    while (el) {
      if (el.hasAttribute('sortable-handle')) this.handle = el;
      if (el.hasAttribute('sortable-item')) this.item = el;
      if (el.hasAttribute('sortable-list')) break;
      el = el.parentElement;
    }
    if (!this.handle) return;

    this.list.style.position = 'relative';
    this.list.style.height = `${this.list.offsetHeight}px`;
    this.item.classList.add('is-dragging');

    this.itemHeight = this.items[1].offsetTop;
    this.listHeight = this.list.offsetHeight;
    this.startTouchY = this.getDragY(e);
    this.startTop = this.item.offsetTop;
    const offsetsTop = this.items.map(item => item.offsetTop);
    this.items.forEach((item, index) => {
      item.style.position = 'absolute';
      item.style.top = 0;
      item.style.left = 0;
      item.style.width = '100%';
      item.style.transform = `translateY(${offsetsTop[index]}px)`;
      item.style.zIndex = item == this.item ? 2 : 1;
      this.dynamicYRange.push(offsetsTop[index]);
    });

    

    setTimeout(() => {
      this.items.forEach(item => {
        if (this.item == item) return;
        item.style.transition = `transform ${this.options.animationSpeed}ms ${this.options.animationEasing}`;
      });
    });

    this.positions = this.items.map((item, index) => index);
    this.position = this.dynamicYRange.findIndex(x=>x==this.startTop) //Math.round(this.startTop / this.listHeight * this.items.length);
    if(this.options.useShadow){
      this.shadow = document.createElement('div');
      this.shadow.style.position = 'absolute';
      this.shadow.style.top = 0;
      this.shadow.style.left = '20px';
      this.shadow.style.width = 'calc(100% - 45px)';
      this.shadow.style.transform = `translateY(${this.startTop}px)`;
      this.shadow.style.zIndex = 1;
      this.shadow.style.transition = `transform ${this.options.animationSpeed}ms ${this.options.animationEasing}`;
      let childShadow = document.createElement('div');
      // childShadow.classList.add('itemShadow')
      childShadow.style.width = `${this.item.getAttribute('shadow-child-width') || this.item.offsetWidth}px`;
      childShadow.style.height = `${this.item.getAttribute('shadow-child-height') || this.item.offsetHeight}px`;
      childShadow.style.boxShadow = '#557ebe87 1px 1px 5px';
      childShadow.style.margin = '0 auto';
      childShadow.style.background= 'rgba(150, 150, 150, 0.49)';
      childShadow.style.boxShadow = `#383838 1px 1px 5px`;
      this.shadow.appendChild(childShadow);
      this.list.appendChild(this.shadow );
    }
    this.touch = e.type == 'touchstart';
    window.addEventListener(this.touch ? 'touchmove' : 'mousemove', this.dragMove, { passive: false });
    window.addEventListener(this.touch ? 'touchend' : 'mouseup', this.dragEnd, false);

  }

  dragMove(e) {
    if (this.animation) return;
    const top = this.startTop + this.getDragY(e) - this.startTouchY;
    let newIndex = -1;
    for(let i = 0 ;i < this.dynamicYRange.length; i++){
        if((top < ((this.dynamicYRange[i]+this.dynamicYRange[i+1])/2)) && top > this.dynamicYRange[i]){
          newIndex = i;
          break; 
        }
        if((top > ((this.dynamicYRange[i]+this.dynamicYRange[i+1])/2)) && top < this.dynamicYRange[i+1]) {
          newIndex = i+1;
          break;
        }
    }
    this.item.style.transform = `translateY(${top}px)`;

    this.positions.forEach(index => {
      if (index == this.position || index != newIndex) return;
      this.swapElements(this.positions, this.position, index);
      this.position = index;
    });
    setTimeout(() => {
      let yH = 0;
      this.dynamicYRange  = []
      for(let i = 0 ; i < this.positions.length; i++){
        yH += 10; 
        if (this.items[this.positions[i]] == this.item) {
          if(this.options.useShadow){
            this.shadow.style.transform = `translateY(${yH}px)`;
          }
          this.dynamicYRange.push(yH);
          yH += this.items[this.positions[i]].offsetHeight;
          continue;
        }
        this.items[this.positions[i]].style.transform = `translateY(${yH}px)`;
        this.dynamicYRange.push(yH);
        yH += this.items[this.positions[i]].offsetHeight ;
      }
    })
    e.preventDefault();
  }

  dragEnd(e) {
    this.animation = true;
    if(this.options.useShadow){
      this.shadow.remove();
    }
    this.item.style.transition = `all ${this.options.animationSpeed}ms ${this.options.animationEasing}`;
    this.item.style.transform = `translateY(${this.position * this.itemHeight}px)`;

    this.item.classList.remove('is-dragging');

    setTimeout(() => {
      this.list.style.position = '';
      this.list.style.height = '';
      this.items.forEach(item => {
        item.style.top = '';
        item.style.left = '';
        item.style.right = '';
        item.style.position = '';
        item.style.transform = '';
        item.style.transition = '';
        item.style.width = '';
        item.style.zIndex = '';
      });

      this.positions.map(i => this.list.appendChild(this.items[i]));
      this.items = Array.from(this.list.children);

      this.animation = false;
    }, this.options.animationSpeed+50);
    
    window.removeEventListener(this.touch ? 'touchmove' : 'mousemove', this.dragMove, { passive: false });
    window.removeEventListener(this.touch ? 'touchend' : 'mouseup', this.dragEnd, false);
  }

  swapElements(array, a, b) {
    const temp = array[a];
    array[a] = array[b];
    array[b] = temp;
    // console.log(array)
  }

  getDragY(e) {
    return e.touches ? (e.touches[0] || e.changedTouches[0]).pageY : e.pageY;
  }

  destroy(callBack = null) {
    this.list.removeEventListener('touchstart', this.dragStart, false);
    this.list.removeEventListener('mousedown', this.dragStart, false);
    if (callBack) {
      callBack();
    }
  }
}
