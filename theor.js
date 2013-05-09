function Theor(){

	var Theor = {
		last_app_timeout: -1,
		current_mark_id: -1,
		current_item_object: null,
		feed_ids: [],

		select_feed: function(d){

			d = d == "down" ? 1 : -1;

			if (this.current_mark_id == -1){
				// User haven't used Theor for navigation yet, find out default item
				var select_default = 0;
				var active_item = $(".folders-list .sort-item.active");

				if (active_item.size()){
					var match = active_item.attr("id").match(/^feed(.*?)$/i);
					if (typeof match[1] != null) select_default = this.feed_ids.indexOf(match[1]);
				}

				this.mark(select_default);

				delete select_default;
				delete active_item;
				delete match;
			}else{

				var select_next = this.current_mark_id;

				while(select_next >= 0 && select_next <= this.feed_ids.length){
					select_next += d;
					if (this.is_visible(select_next)){
						this.mark(select_next);
						break;
					}
				}

			}

		},

		is_visible: function(id){
			return $("#feed" + this.feed_ids[id])[0].style.display != 'none' ? true : false;
		},

		mark: function(id){

			// Can we go to this feed?
			if (id < 0 || id >= this.feed_ids.length) return;

			// Unmark previous item
			if (this.current_item_object != null)
				this.current_item_object.removeClass("mark");
			
			// Query for next item
			this.current_item_object = $("#feed" + this.feed_ids[id]);
			if (this.current_item_object.size() == 0){
				this.current_item_object = null;
				return;
			}

			// If item found mark it
			this.current_item_object.addClass("mark");

			/* Get values for calculation */
			var cio_offset = this.current_item_object.offset();
			var cio_height = this.current_item_object.height();
			var ss_scrollTop = this.sidebar_slide.scrollTop();
			var sidebar_height = this.sidebar.height();
			var reader_container_offset = this.reader_container.offset();
			var view_offset = cio_offset.top - reader_container_offset.top - this.subscribe_height;

			// Scrool sidebar view (if necessary)
			if (view_offset < 0){
				this.sidebar_slide.scrollTop(
					ss_scrollTop - sidebar_height + this.subscribe_height - view_offset + cio_height
				);
			}else if (sidebar_height <= (cio_offset.top - cio_height)){
				this.sidebar_slide.scrollTop(
					cio_offset.top + ss_scrollTop - reader_container_offset.top - this.subscribe_height - cio_height
				);
			}

			this.current_mark_id = id;

		},

		open_selected: function(){
			if (this.current_item_object != null)
				this.current_item_object.find("a").trigger("click");
		},

		init: function(){

			// Append Theor style
			$("html > head").append(
				$("<style>\
					.nav-list li.sort-item.mark { box-shadow: 2px 0px 1px #30a67c; -webkit-border-radius: 2px; }\
				</style>")
			);

			// Unbind default keyboard handles
			Mousetrap.unbind("o", "keydown");
			Mousetrap.unbind("shift+n", "keydown");
			Mousetrap.unbind("shift+p", "keydown");
			Mousetrap.unbind("shift+o", "keydown");

			Mousetrap.bind("shift+n", function(){
				return Theor.select_feed("down");
			}, "keydown");

			Mousetrap.bind("shift+p", function(){
				return Theor.select_feed("up");
			}, "keydown");

			Mousetrap.bind("shift+o", function(){
				return Theor.open_selected();
			}, "keydown");

			this.sidebar = $("#sidebar");
			this.sidebar_slide = $("#sidebar .slide");
			this.subscribe_height = $("#subscribe").height();
			this.reader_container = $(".reader .container-fluid");
			
			// Don't show empty feed items in sidebar
			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					var node = $(mutation.target.parentNode);
					var parent = node.parent().parent();
					var has_hidden = node.hasClass("hidden");
					var is_visible = parent.is(":visible");

					if (!parent.hasClass("nav-header")){
						if (has_hidden && is_visible){
							parent.hide();
						}else if (!has_hidden && !is_visible){
							parent.show();
						}
					}

					delete node;
					delete parent;
					delete has_hidden;
					delete is_visible;
				});
			});

			var target = document.querySelector("#sidebar");
			observer.observe(target, { characterData: true, subtree: true });

			setInterval(this.background_tasks, 1000);

		},
		
		background_tasks: function(){
			if (Theor.last_app_timeout != App.timeout){

				Theor.last_app_timeout = App.timeout;
				Theor.feed_ids = Object.keys(App.feeds);

				Theor.sidebar.find("li.sort-item:visible .badge.hidden").parent().parent().hide();
				Theor.sidebar.find("li.sort-item:hidden .badge:not(.hidden)").parent().parent().show();

			}
		}
	}

	Theor.init();

}

// Create script element with contents of Theor function
var el = document.createElement("script");
el.type = "text/javascript";
el.innerHTML = Theor + " Theor();";

// Inject into main DOM
document.head.appendChild(el);