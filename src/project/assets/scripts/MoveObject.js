
function keydown(event) {

	if (event.key === 'ArrowLeft') this.position.x -= 0.1;
	if (event.key === 'ArrowRight') this.position.x += 0.1;

    if (event.key === 'ArrowUp') this.position.y += 0.1;
	if (event.key === 'ArrowDown') this.position.y -= 0.1;

}
