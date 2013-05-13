function Theor(){

	var Theor = {
		last_app_timeout: -1,
		current_mark_id: -1,
		current_item_object: null,
		feed_ids: [],

		select_feed: function(d){
			// Direction
			d = d == "down" ? 1 : -1;

			// Is theoldreader.com opened with active item selected?
			if (this.current_mark_id == -1){
				var active_item = $(".folders-list .sort-item.active");
				if (active_item.size()){
					var match = active_item.attr("id").match(/^feed(.*?)$/i);
					if (typeof match[1] != null && this.is_visible(this.feed_ids.indexOf(match[1])) && this.mark(this.feed_ids.indexOf(match[1]))){
						return;
					}
				}
			}

			var select_next = this.current_mark_id > -1 ? 
				this.current_mark_id : (d < 1 ? this.feed_ids.length : -1);

			while(select_next >= -1 && select_next <= this.feed_ids.length){
				select_next += d;
				if (this.is_visible(select_next) && this.mark(select_next))
					return;
			}
		},

		// Determine if feed item isn't visible in UI and we should skip over it
		is_visible: function(id){
			return $("#feed" + this.feed_ids[id]).hasClass("hidden") ? false : true;
		},


		mark: function(id){
			// Does feed id is in boundaries of array?
			if (id < 0 || id >= this.feed_ids.length) return false;

			// Release previous feed item from mark 
			if (this.current_item_object != null)
				this.current_item_object.removeClass("mark");
			
			// Find item by its ID
			this.current_item_object = $("#feed" + this.feed_ids[id]);
			if (this.current_item_object.size() == 0){
				this.current_item_object = null;
				return false;
			}

			// If item found mark it
			this.current_item_object.addClass("mark");
			this.current_mark_id = id;

			// All kinda non-so-fancy calculation action here
			var cio_offset = this.current_item_object.offset();
			var cio_height = this.current_item_object.height();
			var ss_scrollTop = this.sidebar_slide.scrollTop();
			var sidebar_height = this.sidebar.height();
			var reader_container_offset = this.reader_container.offset();
			var view_offset = cio_offset.top - reader_container_offset.top - this.subscribe_height;

			// Scroll sidebar view (if its necessary)
			if (view_offset < 0){
				this.sidebar_slide.scrollTop(
					cio_offset.top > 0 ? 
						(ss_scrollTop - sidebar_height + this.subscribe_height + cio_height) : 
						(ss_scrollTop + cio_offset.top + cio_height - sidebar_height - reader_container_offset.top)
				)
			}else if (sidebar_height <= (cio_offset.top - reader_container_offset.top + cio_height)){
				this.sidebar_slide.scrollTop(
					cio_offset.top + ss_scrollTop - reader_container_offset.top - this.subscribe_height - cio_height
				);
			}

			return true;
		},

		open_selected: function(){
			if (this.current_item_object != null)
				this.current_item_object.find("a").trigger("click");
		},

		toggle_navbar: function(){
			if (this.navbar_fixed.is(":visible")){
				this.navbar_fixed.hide();
				this.reader_container.css("top", "5px");
			}else{
				this.reader_container.css("top", this.reader_container_top);
				this.navbar_fixed.show();
			}
		},

		init: function(){
			// Add some style
			$("html > head").append(
				$("<style>\
					.nav-list li.sort-item.mark { box-shadow: 2px 0px 1px #30a67c; -webkit-border-radius: 2px; }\
				</style>")
			);

			// Unbind default keyboard shortcuts
			Mousetrap.unbind("o", "keydown");
			Mousetrap.unbind("shift+n", "keydown");
			Mousetrap.unbind("shift+p", "keydown");
			Mousetrap.unbind("shift+o", "keydown");
			Mousetrap.unbind("shift+f", "keydown");

			// Bind Theor keyboard shortcuts
			Mousetrap.bind("shift+n", function(){ return Theor.select_feed("down"); }, "keydown");
			Mousetrap.bind("shift+p", function(){ return Theor.select_feed("up"); }, "keydown");
			Mousetrap.bind("shift+o", function(){ return Theor.open_selected(); }, "keydown");
			Mousetrap.bind("shift+f", function(){ return Theor.toggle_navbar(); }, "keydown");

			// Cache pointers to commonly used DOM objects
			this.sidebar = $("#sidebar");
			this.navbar_fixed = $(".navbar-fixed-top");
			this.sidebar_slide = $("#sidebar .slide");
			this.subscribe_height = $("#subscribe").height();
			this.reader_container = $(".reader .container-fluid");
			this.reader_container_top = this.reader_container.css("top");

			// Hide navigation bar by default
			this.toggle_navbar();
			// Run background tasks
			setInterval(this.background_tasks, 1000);
		},
		
		// In backrgound refresh App.feeds id list 
		// for faster navigation through feed list
		background_tasks: function(){
			if (Theor.last_app_timeout != App.timeout){
				Theor.last_app_timeout = App.timeout;
				Theor.feed_ids = Object.keys(App.feeds);
			}
		}
	}

	// Initiate Theor
	Theor.init();

}

// Create script element with contents of Theor function
var el = document.createElement("script");
el.type = "text/javascript";
el.innerHTML = Theor + " Theor();";

// Inject into main DOM
document.head.appendChild(el);
