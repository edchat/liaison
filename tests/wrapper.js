define([
	"intern!bdd",
	"intern/chai!expect",
	"decor/Observable",
	"../ObservableArray",
	"../computed",
	"../wrapper"
], function (bdd, expect, Observable, ObservableArray, computed, wrapper) {
	/* jshint withstmt: true */
	/* global describe, it, afterEach */
	with (bdd) {
		describe("Test liaison/wrapper", function () {
			function CustomClz() {}
			var bool = true,
				num = Infinity,
				str = "Foo",
				date = new Date(),
				func = function (foo, bar) {
					console.log(foo);
					console.log(bar);
				},
				custom = new CustomClz(),
				o = {
					undef: undefined,
					null: null,
					foo: "Foo",
					bar: "Bar",
					date: date,
					func: func,
					custom: custom,
					child: {
						foo: "Foo",
						bar: "Bar"
					},
					a: ["Foo", "Bar", date, func, custom, {
						foo: "Foo",
						bar: "Bar"
					}]
				},
				observableTree = new Observable({
					undef: undefined,
					null: null,
					foo: "Foo",
					bar: "Bar",
					date: date,
					func: func,
					custom: custom,
					child: new Observable({
						foo: "Foo",
						bar: "Bar"
					}),
					a: new ObservableArray("Foo", "Bar", date, func, custom, new Observable({
						foo: "Foo",
						bar: "Bar"
					}))
				});
			var handles = [];
			afterEach(function () {
				for (var handle = null; (handle = handles.shift());) {
					handle.remove();
				}
			});
			it("Wrap non-object", function () {
				var o = {};
				o.prop = undefined;
				expect(wrapper.wrap(o)).to.deep.equal(o);
				o.prop = null;
				expect(wrapper.wrap(o)).to.deep.equal(o);
				o.prop = bool;
				expect(wrapper.wrap(o)).to.deep.equal(o);
				o.prop = null;
				expect(wrapper.wrap(o)).to.deep.equal(o);
				o.prop = str;
				expect(wrapper.wrap(o)).to.deep.equal(o);
				o.prop = date;
				expect(wrapper.wrap(o)).to.deep.equal(o);
				o.prop = func;
				expect(wrapper.wrap(o)).to.deep.equal(o);
				o.prop = undefined;
				expect(wrapper.unwrap(o)).to.deep.equal(o);
				o.prop = null;
				expect(wrapper.unwrap(o)).to.deep.equal(o);
				o.prop = bool;
				expect(wrapper.unwrap(o)).to.deep.equal(o);
				o.prop = num;
				expect(wrapper.unwrap(o)).to.deep.equal(o);
				o.prop = str;
				expect(wrapper.unwrap(o)).to.deep.equal(o);
				o.prop = date;
				expect(wrapper.unwrap(o)).to.deep.equal(o);
				o.prop = func;
				expect(wrapper.unwrap(o)).to.deep.equal(o);
			});
			it("Wrap an object", function () {
				var wrapped = wrapper.wrap(o);
				expect(wrapped).to.deep.equal(observableTree);
				expect(Observable.test(wrapped)).not.to.be.false;
				expect(typeof wrapped.date.getTime).to.equal("function");
				expect(wrapped.func.length).to.equal(2);
				expect(wrapped.custom).to.equal(custom);
				expect(Observable.test(wrapped.child)).not.to.be.false;
				expect(ObservableArray.test(wrapped.a)).not.to.be.false;
				expect(typeof wrapped.a[2].getTime).to.equal("function");
				expect(wrapped.a[3].length).to.equal(2);
				expect(wrapped.a[4]).to.equal(custom);
				expect(Observable.test(wrapped.a[5])).not.to.be.false;
			});
			it("Unwrap an observable tree", function () {
				var unwrapped = wrapper.unwrap(observableTree);
				expect(unwrapped).to.deep.equal(o);
				expect(Observable.test(unwrapped)).not.to.be.true;
				expect(typeof unwrapped.date.getTime).to.equal("function");
				expect(unwrapped.func.length).to.equal(2);
				expect(unwrapped.custom).to.equal(custom);
				expect(Observable.test(unwrapped.child)).not.to.be.true;
				expect(ObservableArray.test(unwrapped.a)).not.to.be.true;
				expect(typeof unwrapped.a[2].getTime).to.equal("function");
				expect(unwrapped.a[3].length).to.equal(2);
				expect(unwrapped.a[4]).to.equal(custom);
				expect(Observable.test(unwrapped.a[5])).not.to.be.true;
			});
			it("Round-trip", function () {
				var roundTripped = wrapper.unwrap(wrapper.wrap(o));
				expect(roundTripped).to.deep.equal(o);
				expect(Observable.test(roundTripped)).not.to.be.true;
				expect(typeof roundTripped.date.getTime).to.equal("function");
				expect(roundTripped.func.length).to.equal(2);
				expect(roundTripped.custom).to.equal(custom);
				expect(Observable.test(roundTripped.child)).not.to.be.true;
				expect(ObservableArray.test(roundTripped.a)).not.to.be.true;
				expect(typeof roundTripped.a[2].getTime).to.equal("function");
				expect(roundTripped.a[3].length).to.equal(2);
				expect(roundTripped.a[4]).to.equal(custom);
				expect(Observable.test(roundTripped.a[5])).not.to.be.true;
			});
			it("wrapper.wrap()/wrapper.unwrap() with circular reference in an object tree", function () {
				var o = {};
				o.foo = o;
				wrapper.unwrap(wrapper.wrap(o));
				// Pass the test if above line does not hit the maximum call stack length
			});
		});
	}
});
