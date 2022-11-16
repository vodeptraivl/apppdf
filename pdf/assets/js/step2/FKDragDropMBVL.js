//~ FKVL
class FKDragDropMBVL {
  constructor(list, list2, options, dragEndCallBack = null) {
    this.list = typeof list === 'string' ?
      document.querySelector(list) :
      list;
    this.listConnectName = list2;
    this.dynamicYRange = [];
    this.itemClone = null;
    this.firstADD = false;
    this.idCurrent = "";
    this.animation = false;
    this.shadow = null;
    this.options = Object.assign({
      animationSpeed: 240,
      animationEasing: 'ease-out',
      useShadow: false
    },
      options || {});
    this.dragEndCallBack = dragEndCallBack;
    this.dragStart = this.dragStart.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);

    this.list.addEventListener('touchstart', this.dragStart, false);
    this.list.addEventListener('mousedown', this.dragStart, false);
  }

  preNew() {
    setTimeout(_ => {
      this.items = Array.from(this.list.children);
    }, 1000)
  }


  dragStart(e) {
    if (this.animation) return;
    if (e.type === 'mousedown' && e.which !== 1) return;
    if (e.type === 'touchstart' && e.touches.length > 1) return;
    this.parentElement = this.list.parentElement;
    this.handle = null;
    this.listConnect =
      typeof this.listConnectName === 'string' ?
        document.querySelector(this.listConnectName) :
        this.listConnectName;

    if (this.listConnect == null || this.listConnect.style.display == 'none') {
      return;
    }

    let el = e.target;
    while (el) {
      if (el.hasAttribute('sortable-handle')) this.handle = el;
      if (el.hasAttribute('sortable-item')) this.item = el;
      if (el.hasAttribute('sortable-list')) break;
      el = el.parentElement;
    }

    if (!this.handle) return;
    if ($(`${this.listConnectName} .pageMap[imgid='${this.item.getAttribute('imgid')}']`).length > 0) { return };

    this.dynamicYRange = [];
    this.items = Array.from(this.listConnect.children);
    const offsetsTop = this.items.map(item => item.offsetTop);
    this.positions = null;
    if (this.items.length > 0) {
      this.positions = this.items.map((item, index) => index);
      this.items.forEach((item, index) => {
        item.style.position = 'absolute';
        item.style.top = 0;
        item.style.left = 0;
        item.style.width = '100%';
        item.style.transform = `translateY(${offsetsTop[index]}px)`;
        item.style.zIndex = 1;
       this.dynamicYRange.push(offsetsTop[index]);
      });
    }
    setTimeout(() => {
      this.items.forEach(item => {
        if (this.item == item) return;
        item.style.transition = `transform ${this.options.animationSpeed}ms ${this.options.animationEasing}`;
      });
    });

    this.offsetLeftListConnect = this.listConnect.offsetLeft;
    this.itemClone = this.item.cloneNode(true);
    this.list.style.position = 'relative';
    this.parentElement.style.position = 'relative';
    this.startTouchY = this.getDragY(e);
    this.startTouchX = this.getDragX(e);
    this.startTop = this.item.offsetTop;
    this.startLeft = this.item.offsetLeft;

    this.itemClone.style.position = 'absolute';
    this.itemClone.style.top = `${this.startTop - this.list.scrollTop}px`;
    this.itemClone.style.left = `${this.item.offsetLeft + 10}px`;
    // this.itemClone.style.width = `${this.list.offsetWidth}px`;
    this.itemClone.style.zIndex = 1;
    this.list.parentElement.appendChild(this.itemClone);
    this.idCurrent = this.itemClone.getAttribute('imgid');
    this.touch = e.type == 'touchstart';
    window.addEventListener(this.touch ? 'touchmove' : 'mousemove', this.dragMove, { passive: false });
    window.addEventListener(this.touch ? 'touchend' : 'mouseup', this.dragEnd, false);
  }

  dragMove(e) {
    if (this.animation) return;
    const top = this.startTop + this.getDragY(e) - this.startTouchY - this.list.scrollTop;
    const left = this.startLeft + this.getDragX(e) - this.startTouchX;
    this.itemClone.style.top = `${top}px`;
    this.itemClone.style.left = `${left - 5}px`;
    let newLeft = left + this.itemClone.offsetWidth / 2 - 50;
    let ids = `${this.listConnectName} .pageMap[imgid='${this.itemClone.getAttribute('imgid')}']`;
    if (newLeft > this.offsetLeftListConnect) {
      if ($(ids).length == 0) {
        this.itemConnect = this.item.cloneNode(true);
        this.itemConnect.style.position = 'absolute';
        this.itemConnect.style.top = this.positions == null ? 10 : 0;
        this.itemConnect.style.left = 0;
        this.itemConnect.style.width = '100%';
        this.itemConnect.children[1].classList.remove('active');
        this.itemConnect.children[1].classList.add('dragEle');
        this.itemConnect.style.opacity = this.positions == null ? 0.8 : 0;
        // this.itemConnect.style.display = 'none';
        this.listConnect.appendChild(this.itemConnect);
        this.items.push(this.itemConnect);
        if (this.positions) {
          this.position = Math.max(...this.positions) + 1;
          this.positions.push(this.position);
          this.dynamicYRange.push(Math.max(...this.dynamicYRange) + (+this.itemConnect.offsetHeight) + 10);
          
        }
        this.firstADD = true;
        // setTimeout(_=>{this.itemConnect.style.opacity = 0.8;},200)
      }
      if (this.positions) {
        let newIndex = this.getNewIndx(top + this.listConnect.scrollTop);

        // console.log(newIndex)
        if (this.firstADD) {
          let newPos = [];
          this.positions.map((x, i) => {
            if (i == newIndex) {
              newPos.push(this.position)
            }
            newPos.push(i)
          });
          newPos.pop();
          this.positions = newPos;
          this.position = newIndex;
          this.firstADD = false;
        } else {
          this.positions.forEach(index => {
            if (index == this.position || index != newIndex) return;
            this.swapElements(this.positions, this.position, index);
            this.position = index;
          });
        }
        this.moveElement();
        this.itemConnect.style.transition = `transform ${this.options.animationSpeed}ms ${this.options.animationEasing}`;
      }
    } else {
      if($(ids).length == 1){
        this.itemConnect.remove();
        this.itemConnect = null;
        if(this.positions){
          this.positions.splice(this.position,1);
          this.dynamicYRange.splice(this.position,1);
        }
        this.items.pop();
        this.moveElement();
      }
    }

    e.preventDefault();
  }

  dragEnd(e) {
    this.itemClone.remove();
    this.animation = true;
    if (this.options.useShadow) {
      this.shadow.remove();
    }

    if (this.itemConnect) {
      this.itemConnect = null;
    }

    setTimeout(() => {
      this.items.forEach(item => {
        item.style.top = '';
        item.style.left = '';
        item.style.right = '';
        item.style.position = '';
        item.style.transform = '';
        item.style.transition = '';
        item.style.width = '';
        item.style.zIndex = '';
        item.style.opacity = '';
        item.children[1].classList.remove('dragEle')
      });

      if (this.positions) {
        this.positions.map(i => this.listConnect.appendChild(this.items[i]));
      }

      this.animation = false;
    }, 450);


    window.removeEventListener(this.touch ? 'touchmove' : 'mousemove', this.dragMove, { passive: false });
    window.removeEventListener(this.touch ? 'touchend' : 'mouseup', this.dragEnd, false);

    if(this.dragEndCallBack){
      this.dragEndCallBack();
    }
  }

  swapElements(array, a, b) {
    const temp = array[a];
    array[a] = array[b];
    array[b] = temp;
  }

  getDragY(e) {
    return e.touches ? (e.touches[0] || e.changedTouches[0]).pageY : e.pageY;
  }

  getDragX(e) {
    return e.touches ? (e.touches[0] || e.changedTouches[0]).pageX : e.pageX;
  }

  getNewIndx(top) {
    for (let i = 0; i < this.dynamicYRange.length; i++) {
      if ((top < ((this.dynamicYRange[i] + this.dynamicYRange[i + 1]) / 2)) && top > this.dynamicYRange[i]) {
        return i;
      }
      if ((top > ((this.dynamicYRange[i] + this.dynamicYRange[i + 1]) / 2)) && top < this.dynamicYRange[i + 1]) {

        return i + 1;
      }
    }

    return this.position;
  }

  moveElement() {
    setTimeout(() => {
      let yH = 0;
      this.dynamicYRange = []
      if(this.positions){
        for (let i = 0; i < this.positions.length; i++) {
          yH += 10;
          this.items[this.positions[i]].style.transform = `translateY(${yH}px)`;
          this.dynamicYRange.push(yH);
          yH += this.items[this.positions[i]].offsetHeight;
          let id = this.items[this.positions[i]].getAttribute('imgid');
          if (id == this.idCurrent) {
            let i2 = this.positions[i];
            setTimeout(_ => { 
              if(this.items[i2])this.items[i2].style.opacity = 1 
            }, 
            this.options.animationSpeed + 10)
          }
        };
      }
      
    })
  }

  destroy(callBack = null) {
    this.list.removeEventListener('touchstart', this.dragStart, false);
    this.list.removeEventListener('mousedown', this.dragStart, false);
    if (callBack) {
      callBack();
    }
  }
}
